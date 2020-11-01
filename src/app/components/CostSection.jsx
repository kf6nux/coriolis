import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import Persist from '../stores/Persist';
import Ship from '../shipyard/Ship';
import { Insurance } from '../shipyard/Constants';
import TranslatedComponent from './TranslatedComponent';
import { ShoppingIcon } from './SvgIcons';
import autoBind from 'auto-bind';
import { assign, differenceBy, sortBy, reverse } from 'lodash';
import { FUEL_CAPACITY } from 'ed-forge/lib/ship-stats';

/**
 * Cost Section
 */
export default class CostSection extends TranslatedComponent {
  static propTypes = {
    ship: PropTypes.object.isRequired,
    code: PropTypes.string.isRequired,
    buildName: PropTypes.string,
  };

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   */
  constructor(props) {
    super(props);
    autoBind(this);

    this.state = {
      retrofitName: this._defaultRetrofitName(props.ship, props.buildName),
      shipDiscount: Persist.getShipDiscount(),
      moduleDiscount: Persist.getModuleDiscount(),
      insurance: Insurance[Persist.getInsurance()],
      tab: Persist.getCostTab(),
      buildOptions: Persist.getBuildsNamesFor(props.ship.getShipType()),
      predicate: 'cr',
      desc: true,
      excluded: {},
    };
  }

  /**
   * Create a ship instance to base/reference retrofit changes from
   * @param  {string} ship         Ship
   * @param  {string} name         Build name
   * @param  {Ship} retrofitShip   Existing retrofit ship
   * @return {Ship}                Retrofit ship
   */
  _buildRetrofitShip(ship, name, retrofitShip) {
    // TODO: once ships have been persisted, this can be fixed
    return ship;
    // let data = Ships[shipId];   // Retrieve the basic ship properties, slots and defaults

    // if (!retrofitShip) {  // Don't create a new instance unless needed
    //   retrofitShip = new Ship(shipId, data.properties, data.slots);  // Create a new Ship for retrofit comparison
    // }

    // if (Persist.hasBuild(shipId, name)) {
    //   retrofitShip.buildFrom(Persist.getBuild(shipId, name));  // Populate modules from existing build
    // } else {
    //   retrofitShip.buildWith(data.defaults);  // Populate with default components
    // }
    // return retrofitShip;
  }

  /**
   * Get the default retrofit build name if it exists
   * @param  {string} ship         Ship
   * @param  {string} name         Build name
   * @return {string}              Build name or null
   */
  _defaultRetrofitName(ship, name) {
    return Persist.hasBuild(ship.getShipType(), name) ? name : null;
  }

  /**
   * Show selected tab
   * @param  {string} tab Tab name
   */
  _showTab(tab) {
    Persist.setCostTab(tab);
    this.setState({ tab });
  }

  /**
   * Update prices on discount change
   */
  _onDiscountChanged() {
    let shipDiscount = Persist.getShipDiscount();
    let moduleDiscount = Persist.getModuleDiscount();
    this.setState({ shipDiscount, moduleDiscount });
  }

  /**
   * Update insurance on change
   * @param  {string} insuranceName Insurance level name
   */
  _onInsuranceChanged(insuranceName) {
    this.setState({ insurance: Insurance[insuranceName] });
  }

  /**
   * Repopulate modules on retrofit ship from existing build
   * @param  {SyntheticEvent} event Build name to base the retrofit ship on
   */
  _onBaseRetrofitChange(event) {
    this.setState({ retrofitName: event.target.value });
  }

  /**
   * Toggle item cost inclusion
   * @param  {String} key Key of the row to toggle
   */
  _toggleExcluded(key) {
    let { excluded } = this.state;
    excluded = assign({}, excluded);
    const slotExcluded = excluded[key];
    excluded[key] = (slotExcluded === undefined ? true : !slotExcluded);
    this.setState({ excluded });
  }

  /**
   * Set list sort predicate
   * @param  {string} newPredicate sort predicate
   */
  _sortBy(newPredicate) {
    let { predicate, desc } = this.state;

    if (newPredicate == predicate) {
      desc = !desc;
    }

    this.setState({ predicate: newPredicate, desc });
  }

  /**
   * Render the cost tab
   * @return {React.Component} Tab contents
   */
  _costsTab() {
    let { ship } = this.props;
    let {
      excluded, shipDiscount, moduleDiscount, insurance, desc, predicate
    } = this.state;
    let { translate, formats, units } = this.context.language;
    let rows = [];

    let modules = sortBy(
      ship.getModules(),
      (predicate === 'm' ? (m) => m.getItem() : (m) => m.readMeta('cost'))
    );
    if (desc) {
      reverse(modules);
    }

    let totalCost = 0;
    for (let module of modules) {
      const cost = module.readMeta('cost');
      const slot = module.getSlot();
      if (cost) {
        let toggle = this._toggleExcluded.bind(this, slot);
        const disabled = excluded[slot];
        if (!disabled) {
          totalCost += cost;
        }
        rows.push(<tr key={slot} className={cn('highlight', { disabled })}>
          <td className='ptr' style={{ width: '1em' }} onClick={toggle}>{module.getClassRating()}</td>
          <td className='le ptr shorten cap' onClick={toggle}>{translate(module.readMeta('type'))}</td>
          <td className='ri ptr' onClick={toggle}>{formats.int(cost * (1 - moduleDiscount))}{units.CR}</td>
        </tr>);
      }
    }

    return <div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr className='main'>
            <th colSpan='2' className='sortable le' onClick={() => this._sortBy('m')}>
              {translate('module')}
              {shipDiscount ? <u className='cap optional-hide' style={{ marginLeft: '0.5em' }}>{`[${translate('ship')} -${formats.pct(shipDiscount)}]`}</u> : null}
              {moduleDiscount ? <u className='cap optional-hide' style={{ marginLeft: '0.5em' }}>{`[${translate('modules')} -${formats.pct(moduleDiscount)}]`}</u> : null}
            </th>
            <th className='sortable le' onClick={() => this._sortBy('cr')} >{translate('credits')}</th>
          </tr>
        </thead>
        <tbody>
          {rows}
          <tr className='ri'>
            <td colSpan='2' className='lbl' >{translate('total')}</td>
            <td className='val'>{formats.int(totalCost)}{units.CR}</td>
          </tr>
          <tr className='ri'>
            <td colSpan='2' className='lbl'>{translate('insurance')}</td>
            <td className='val'>{formats.int(totalCost * insurance)}{units.CR}</td>
          </tr>
        </tbody>
      </table>
    </div>;
  }

  /**
   * Open up a window for EDDB with a shopping list of our retrofit components
   */
  _eddbShoppingList() {
    const {} = this.state;
    const { ship } = this.props;

    // Provide unique list of non-PP module EDDB IDs to buy
    // const modIds = retrofitCosts.filter(item => item.retroItem.incCost && item.buyId && !item.buyPp).map(item => item.buyId).filter((v, i, a) => a.indexOf(v) === i);

    // Open up the relevant URL
    // TODO:
    // window.open('https://eddb.io/station?m=' + modIds.join(','));
  }

  /**
   *
   */
  _retrofitInfo() {
    const { ship } = this.props;
    const { desc, moduleDiscount, predicate, retrofitName } = this.state;
    const retrofitShip = this._buildRetrofitShip(ship, retrofitName);

    const currentModules = ship.getModules();
    const oldModules = retrofitShip.getModules();
    const buyModules = differenceBy(currentModules, oldModules, (m) => m.getItem());
    const sellModules = differenceBy(oldModules, currentModules, (m) => m.getItem());

    let modules = [];
    for (let m of buyModules) {
      const key = `buy_${m.getSlot()}`;
      modules.push({
        key,
        cost: m.readMeta('cost') * (1 - moduleDiscount),
        buyRating: m.getClassRating(),
        buyItem: m.readMeta('type'),
      });
    }
    for (let m of sellModules) {
      const key = `sell_${m.getSlot()}`;
      modules.push({
        key,
        cost: -1 * m.readMeta('cost') * moduleDiscount,
        sellRating: m.getClassRating(),
        sellItem: m.readMeta('type'),
      });
    }

    let _sortF = undefined;
    switch (predicate) {
      case 'cr': _sortF = (o) => o.cost;
      case 'm':
      default: _sortF = (o) => o.buyItem || o.sellItem;
    };

    modules = sortBy(modules, _sortF);
    if (desc) {
      reverse(modules);
    }
    return modules;
  }

  /**
   * Render the retofit tab
   * @return {React.Component} Tab contents
   */
  _retrofitTab() {
    let { excluded, moduleDiscount, retrofitName } = this.state;
    const { termtip, tooltip } = this.context;
    let { translate, formats, units } = this.context.language;
    let int = formats.int;
    let options = [<option key='stock' value=''>{translate('Stock')}</option>];

    for (let opt of this.state.buildOptions) {
      options.push(<option key={opt} value={opt}>{opt}</option>);
    }

    const retrofitInfo = this._retrofitInfo();
    const retrofitTotal = 0;
    let rows = [];
    for (let i of retrofitInfo) {
      const disabled = excluded[i.key];
      rows.push(
        <tr key={i.key} className={cn('highlight', { disabled })}
          onClick={() => this._toggleExcluded(i.key)}>
          <td className='ptr' style={{ width: '1em' }}>{i.buyRating}</td>
          <td className='le ptr shorten cap'>{translate(i.buyItem)}</td>
          <td className='ptr' style={{ width: '1em' }}>{i.sellRating}</td>
          <td className='le ptr shorten cap'>{translate(i.sellItem)}</td>
          <td colSpan='2' className={cn('ri ptr', disabled ? 'disabled' : (i.cost < 0 ? 'secondary-disabled' : 'warning'))}>
            {int(i.cost)}{units.CR}
          </td>
        </tr>
      );
      retrofitTotal += disabled ? 0 : i.cost;
    }
    if (!rows.length) {
      rows = <tr><td colSpan='7' style={{ padding: '3em 0' }}>{translate('PHRASE_NO_RETROCH')}</td></tr>;
    }

    return <div>
      <div className='scroll-x'>
        <table style={{ width: '100%' }}>
          <thead>
            <tr className='main'>
              <th colSpan='2' className='sortable le' onClick={() => this._sortBy('m')}>{translate('sell')}</th>
              <th colSpan='2' className='sortable le' onClick={() => this._sortBy('m')}>{translate('buy')}</th>
              <th colSpan='2' className='sortable le' onClick={() => this._sortBy('cr')}>
                {translate('net cost')}
                {moduleDiscount ? <u className='cap optional-hide' style={{ marginLeft: '0.5em' }}>{`[${translate('modules')} -${formats.pct(moduleDiscount)}]`}</u> : null}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows}
            <tr className='ri'>
              <td className='lbl' ><button onClick={this._eddbShoppingList} onMouseOver={termtip.bind(null, 'PHRASE_REFIT_SHOPPING_LIST')} onMouseOut={tooltip.bind(null, null)}><ShoppingIcon className='lg' style={{ fill: 'black' }}/></button></td>
              <td colSpan='3' className='lbl' >{translate('cost')}</td>
              <td colSpan='2' className={cn('val', retrofitTotal > 0 ? 'warning' : 'secondary-disabled')} style={{ borderBottom:'none' }}>
                {int(retrofitTotal)}{units.CR}
              </td>
            </tr>
            <tr className='ri'>
              <td colSpan='4' className='lbl cap' >{translate('retrofit from')}</td>
              <td className='val cen' style={{ borderRight: 'none', width: '1em' }}><u className='primary-disabled'>&#9662;</u></td>
              <td className='val' style={{ borderLeft:'none', padding: 0 }}>
                <select style={{ width: '100%', padding: 0 }} value={retrofitName || translate('Stock')} onChange={this._onBaseRetrofitChange}>
                  {options}
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>;
  }

  /**
   *
   * @param {*} modules
   */
  _ammoInfo() {
    const { ship } = this.props;
    const { desc, predicate } = this.state;

    let info = [{
      key: 'fuel',
      item: 'Fuel',
      qty: ship.get(FUEL_CAPACITY),
      unitCost: 50,
      cost: 50 * ship.get(FUEL_CAPACITY),
    }];
    for (let m of ship.getModules()) {
      const rebuilds = m.get('bays') * m.get('rebuildsperbay');
      const ammo = (m.get('ammomaximum') + m.get('ammoclipsize')) || rebuilds;
      if (ammo) {
        const unitCost = m.readMeta('ammocost');
        info.push({
          key: `restock_${m.getSlot()}`,
          rating: m.getClassRating(),
          item: m.readMeta('type'),
          qty: ammo,
          unitCost, cost: unitCost * ammo,
        });
      }
    }

    let _sortF = undefined;
    switch (predicate) {
      case 'cr': _sortF = (o) => o.cost; break;
      case 'qty': _sortF = (o) => o.qty; break;
      case 'cost': _sortF = (o) => o.unitCost; break;
      case 'm':
      default: _sortF = (o) => o.item;
    }
    info = sortBy(info, _sortF);
    if (desc) {
      reverse(info);
    }

    return info;
  }

  /**
   * Render the ammo tab
   * @return {React.Component} Tab contents
   */
  _ammoTab() {
    const { excluded } = this.state;
    const { translate, formats, units } = this.context.language;
    const int = formats.int;
    const rows = [];

    const ammoInfo = this._ammoInfo();
    let total = 0;
    for (let i of ammoInfo) {
      const disabled = excluded[i.key];
      rows.push(<tr key={i.key} onClick={() => this._toggleExcluded(i.key)}
        className={cn('highlight', { disabled })}>
        <td style={{ width: '1em' }}>{i.rating}</td>
        <td className='le shorten cap'>{translate(i.item)}</td>
        <td className='ri'>{int(i.qty)}</td>
        <td className='ri'>{int(i.unitCost)}{units.CR}</td>
        <td className='ri'>{int(i.cost)}{units.CR}</td>
      </tr>);
      total += disabled ? 0 : i.cost;
    }

    return <div>
      <div className='scroll-x' >
        <table style={{ width: '100%' }}>
          <thead>
            <tr className='main'>
              <th colSpan='2' className='sortable le' onClick={() => this._sortBy('m')}>{translate('module')}</th>
              <th colSpan='1' className='sortable le' onClick={() => this._sortBy('qty')}>{translate('qty')}</th>
              <th colSpan='1' className='sortable le' onClick={() => this._sortBy('cost')}>{translate('unit cost')}</th>
              <th className='sortable le' onClick={() => this._sortBy('cr')}>{translate('subtotal')}</th>
            </tr>
          </thead>
          <tbody>
            {rows}
            <tr className='ri'>
              <td colSpan='4' className='lbl' >{translate('total')}</td>
              <td className='val'>{int(total)}{units.CR}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>;
  }

  /**
   * Add listeners on mount and update costs
   */
  componentWillMount() {
    this.listeners = [
      Persist.addListener('discounts', this._onDiscountChanged.bind(this)),
      Persist.addListener('insurance', this._onInsuranceChanged.bind(this)),
    ];
  }

  /**
   * Remove listeners
   */
  componentWillUnmount() {
    this.listeners.forEach(l => l.remove());
  }

  /**
   * Render the Cost section
   * @return {React.Component} Contents
   */
  render() {
    let tab = this.state.tab;
    let translate = this.context.language.translate;
    let tabSection;

    switch (tab) {
      case 'ammo': tabSection = this._ammoTab(); break;
      case 'retrofit': tabSection = this._retrofitTab(); break;
      default:
        tab = 'costs';
        tabSection = this._costsTab();
    }

    return (
      <div className='group half'>
        <table className='tabs'>
          <thead>
            <tr>
              <th style={{ width:'33%' }} className={cn({ active: tab == 'costs' })} onClick={this._showTab.bind(this, 'costs')} >{translate('costs')}</th>
              <th style={{ width:'33%' }} className={cn({ active: tab == 'retrofit' })} onClick={this._showTab.bind(this, 'retrofit')} >{translate('retrofit costs')}</th>
              <th style={{ width:'34%' }} className={cn({ active: tab == 'ammo' })} onClick={this._showTab.bind(this, 'ammo')} >{translate('reload costs')}</th>
            </tr>
          </thead>
        </table>
        {tabSection}
      </div>
    );
  }
}
