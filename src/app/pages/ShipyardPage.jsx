import React from 'react';
import Page from './Page';
import cn from 'classnames';
import { Factory } from 'ed-forge';
import { SizeMap } from '../shipyard/Constants';
import Link from '../components/Link';

/**
 * Generate Ship summary and aggregated properties
 * @param  {String} shipId   Ship Id
 * @return {Object}          Ship summary and aggregated properties
 */
function shipSummary(shipId) {
  // Build Ship
  let ship = Factory.newShip(shipId);

  let coreSizes = ship.readMeta('coreSizes');
  let summary = {
    baseArmour: ship.getBaseProperty('basearmour'),
    baseShieldStrength: ship.getBaseProperty('baseshieldstrength'),
    boost: ship.getBaseProperty('boost'),
    class: ship.readMeta('class'),
    crew: ship.readMeta('crew'),
    id: shipId,
    hardness: ship.getBaseProperty('hardness'),
    hpCount: 0,
    hullMass: ship.getBaseProperty('hullmass'),
    intCount: 0,
    manufacturer: ship.readMeta('manufacturer'),
    masslock: ship.getBaseProperty('masslock'),
    maxCargo: 0,
    maxPassengers: 0,
    hp: [0, 0, 0, 0, 0], // Utility, Small, Medium, Large, Huge
    int: [0, 0, 0, 0, 0, 0, 0, 0], // Sizes 1 - 8
    retailCost: ship.readMeta('retailCost'),
    speed: ship.getBaseProperty('speed'),
    standard: [
      'powerplant',
      'mainengines',
      'frameshiftdrive',
      'lifesupport',
      'powerdistributor',
      'radar',
      'fueltank'
    ].map(k => coreSizes[k]),
    agility:
      ship.getBaseProperty('pitch') +
      ship.getBaseProperty('yaw') +
      ship.getBaseProperty('roll')
  };

  // Count Hardpoints by class
  ship.getHardpoints(undefined, true).forEach(hardpoint => {
    summary.hp[hardpoint.getSize()]++;
    summary.hpCount++;
  });
  // Count Internal Compartments by class
  ship.getInternals(undefined, true).forEach(internal => {
    summary.int[internal.getSize()]++;
    summary.intCount++;
  });
  // ship.optimizeMass({ pd: '1D' }); // Optimize Mass with 1D PD for maximum possible jump range
  summary.maxJumpRange = -1; // ship.unladenRange; // Record Jump Range

  // Best thrusters
  // let th;
  // if (ship.standard[1].maxClass === 3) {
  //   th = 'tz';
  // } else if (ship.standard[1].maxClass === 2) {
  //   th = 'u0';
  // } else {
  //   th = ship.standard[1].maxClass + 'A';
  // }

  // ship.optimizeMass({ th, fsd: '2D', ft: '1C' }); // Optmize mass with Max Thrusters
  summary.topSpeed = -1; // ship.topSpeed;
  summary.topBoost = -1; // ship.topBoost;

  return summary;
}

/**
 * The Shipyard summary page
 */
export default class ShipyardPage extends Page {
  static cachedShipSummaries = null;

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   * @param  {Object} context React Component context
   */
  constructor(props, context) {
    super(props, context);

    if (!ShipyardPage.cachedShipSummaries) {
      ShipyardPage.cachedShipSummaries = [];
      for (let s of Factory.getAllShipTypes()) {
        ShipyardPage.cachedShipSummaries.push(shipSummary(s));
      }
    }

    this.state = {
      title: 'Coriolis EDCD Edition - Shipyard',
      shipPredicate: 'id',
      shipDesc: true,
      shipSummaries: ShipyardPage.cachedShipSummaries,
      compare: {},
      groupCompared: false,
    };
  }

  /**
   * Higlight the current ship in the table on mouse over
   * @param  {String} shipId Ship Id
   * @param  {SyntheticEvent} event  Event
   */
  _highlightShip(shipId, event) {
    event.stopPropagation();
    this.setState({ shipId });
  }

  /**
   * Toggle compare highlighting for ships in the table
   * @param {String} shipId Ship Id
   */
  _toggleCompare(shipId) {
    let compare = this.state.compare;
    compare[shipId] = !compare[shipId];
    this.setState({ compare });
  }

  /**
   * Toggle grouping of compared ships in the table
   * @private
   */
  _toggleGroupCompared() {
    this.setState({ groupCompared: !this.state.groupCompared });
  }

  /**
   * Update state with the specified sort predicates
   * @param  {String} shipPredicate      Sort predicate - property name
   * @param  {number} shipPredicateIndex Sort predicate - property index
   */
  _sortShips(shipPredicate, shipPredicateIndex) {
    let shipDesc = this.state.shipDesc;

    if (typeof shipPredicateIndex == 'object') {
      shipPredicateIndex = undefined;
    }

    if (
      this.state.shipPredicate == shipPredicate &&
      this.state.shipPredicateIndex == shipPredicateIndex
    ) {
      shipDesc = !shipDesc;
    }

    this.setState({ shipPredicate, shipDesc, shipPredicateIndex });
  }

  /**
   * Generate the table row summary for the ship
   * @param  {Object} s           Ship summary
   * @param  {Function} translate Translate function
   * @param  {Object} u           Localized unit map
   * @param  {Function} fInt      Localized integer formatter
   * @param  {Function} fRound    Localized round formatter
   * @return {React.Component}    Table Row
   */
  _shipRowElement(s, translate, u, fInt, fRound) {
    let noTouch = this.context.noTouch;

    return (
      <tr
        key={s.id}
        style={{ height: '1.5em' }}
        className={cn({
          highlighted: noTouch && this.state.shipId === s.id,
          comparehighlight: this.state.compare[s.id],
        })}
        onMouseEnter={noTouch && this._highlightShip.bind(this, s.id)}
        onClick={() => this._toggleCompare(s.id)}
      >
        <td className="ri">{s.manufacturer}</td>
        <td className="ri">{fInt(s.retailCost)}</td>
        <td className="ri cap">{translate(SizeMap[s.class])}</td>
        <td className="ri">{fInt(s.crew)}</td>
        <td className="ri">{s.masslock}</td>
        <td className="ri">{fInt(s.agility)}</td>
        <td className="ri">{fInt(s.hardness)}</td>
        <td className="ri">{fInt(s.hullMass)}</td>
        <td className="ri">{fInt(s.speed)}</td>
        <td className="ri">{fInt(s.boost)}</td>
        <td className="ri">{fInt(s.baseArmour)}</td>
        <td className="ri">{fInt(s.baseShieldStrength)}</td>
        <td className="ri">{fInt(s.topSpeed)}</td>
        <td className="ri">{fInt(s.topBoost)}</td>
        <td className="ri">{fRound(s.maxJumpRange)}</td>
        <td className="ri">{fInt(s.maxCargo)}</td>
        <td className="ri">{fInt(s.maxPassengers)}</td>
        <td className="cn">{s.standard[0]}</td>
        <td className="cn">{s.standard[1]}</td>
        <td className="cn">{s.standard[2]}</td>
        <td className="cn">{s.standard[3]}</td>
        <td className="cn">{s.standard[4]}</td>
        <td className="cn">{s.standard[5]}</td>
        <td className="cn">{s.standard[6]}</td>
        <td className={cn({ disabled: !s.hp[1] })}>{s.hp[1]}</td>
        <td className={cn({ disabled: !s.hp[2] })}>{s.hp[2]}</td>
        <td className={cn({ disabled: !s.hp[3] })}>{s.hp[3]}</td>
        <td className={cn({ disabled: !s.hp[4] })}>{s.hp[4]}</td>
        <td className={cn({ disabled: !s.hp[0] })}>{s.hp[0]}</td>
        <td className={cn({ disabled: !s.int[0] })}>{s.int[0]}</td>
        <td className={cn({ disabled: !s.int[1] })}>{s.int[1]}</td>
        <td className={cn({ disabled: !s.int[2] })}>{s.int[2]}</td>
        <td className={cn({ disabled: !s.int[3] })}>{s.int[3]}</td>
        <td className={cn({ disabled: !s.int[4] })}>{s.int[4]}</td>
        <td className={cn({ disabled: !s.int[5] })}>{s.int[5]}</td>
        <td className={cn({ disabled: !s.int[6] })}>{s.int[6]}</td>
        <td className={cn({ disabled: !s.int[7] })}>{s.int[7]}</td>
      </tr>
    );
  }

  /**
   * Render the Page
   * @return {React.Component} The page contents
   */
  renderPage() {
    let { sizeRatio, language, termtip, noTouch } = this.context;
    let { translate, formats, units } = language;
    let hide = this.context.tooltip.bind(null, null);
    let fInt = formats.int;
    let { shipSummaries, shipPredicate, shipPredicateIndex, compare, groupCompared } = this.state;
    let sortShips = (predicate, index) =>
      this._sortShips.bind(this, predicate, index);

    let filters = {
      // 'class': { 1: 1, 2: 1}
    };

    shipSummaries = shipSummaries.filter(s => {
      for (let prop in filters) {
        if (!(s[prop] in filters[prop])) {
          return false;
        }
      }
      return true;
    });

    // Sort shipsOverview
    shipSummaries.sort((a, b) => {
      let valA = a[shipPredicate],
          valB = b[shipPredicate];

      if (shipPredicateIndex != undefined) {
        valA = valA[shipPredicateIndex];
        valB = valB[shipPredicateIndex];
      }

      if (!this.state.shipDesc) {
        let val = valA;
        valA = valB;
        valB = val;
      }

      if (groupCompared) {
        if (compare[a.id] && !compare[b.id]) {
          return -1;
        }
        if (!compare[a.id] && compare[b.id]) {
          return 1;
        }
      }

      if (valA == valB) {
        if (a.id > b.id) {
          return 1;
        } else {
          return -1;
        }
      } else if (valA > valB) {
        return 1;
      } else {
        return -1;
      }
    });

    let i = 0;
    let shipRows = new Array(shipSummaries.length);
    let detailRows = new Array(shipSummaries.length);

    for (let s of shipSummaries) {
      detailRows[i] = this._shipRowElement(
        s,
        translate,
        units,
        fInt,
        formats.f1,
      );
      shipRows[i] = (
        <tr
          key={i}
          style={{ height: '1.5em' }}
          className={cn({
            highlighted: noTouch && this.state.shipId === s.id,
            comparehighlight: this.state.compare[s.id],
          })}
          onMouseEnter={noTouch && this._highlightShip.bind(this, s.id)}
          onClick={() => this._toggleCompare(s.id)}
        >
          <td className="le">
            <Link href={'/outfit/' + s.id}>{s.id} {s.beta === true ? '(Beta)' : null}</Link>
          </td>
        </tr>
      );
      i++;
    }

    return (
      <div className="page" style={{ fontSize: sizeRatio + 'em' }}>
        <div className="content-wrapper">
          <div className="shipyard-table-wrapper">
            <table style={{ width: '12em', position: 'absolute', zIndex: 1 }} className="shipyard-table">
              <thead>
                <tr>
                  <th className="le rgt">&nbsp;</th>
                </tr>
                <tr className="main">
                  <th className="sortable le rgt" onClick={sortShips('id')}>
                    {translate('ship')}
                  </th>
                </tr>
                <tr>
                  <th className="le rgt invisible">{units['m/s']}</th>
                </tr>
              </thead>
              <tbody onMouseLeave={this._highlightShip.bind(this, null)}>
                {shipRows}
              </tbody>
            </table>
            <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
              <table style={{ marginLeft: 'calc(12em - 1px)', zIndex: 0 }} className="shipyard-table">
                <thead>
                  <tr className="main">
                    <th
                      rowSpan={3}
                      className="sortable"
                      onClick={sortShips('manufacturer')}
                    >
                      {translate('manufacturer')}
                    </th>
                    <th>&nbsp;</th>
                    <th
                      rowSpan={3}
                      className="sortable"
                      onClick={sortShips('class')}
                    >
                      {translate('size')}
                    </th>
                    <th
                      rowSpan={3}
                      className="sortable"
                      onClick={sortShips('crew')}
                    >
                      {translate('crew')}
                    </th>
                    <th
                      rowSpan={3}
                      className="sortable"
                      onMouseEnter={termtip.bind(null, 'mass lock factor')}
                      onMouseLeave={hide}
                      onClick={sortShips('masslock')}
                    >
                      {translate('MLF')}
                    </th>
                    <th
                      rowSpan={3}
                      className="sortable"
                      onClick={sortShips('agility')}
                    >
                      {translate('agility')}
                    </th>
                    <th
                      rowSpan={3}
                      className="sortable"
                      onMouseEnter={termtip.bind(null, 'hardness')}
                      onMouseLeave={hide}
                      onClick={sortShips('hardness')}
                    >
                      {translate('hrd')}
                    </th>
                    <th>&nbsp;</th>
                    <th colSpan={4}>{translate('base')}</th>
                    <th colSpan={5}>{translate('max')}</th>
                    <th className="lft" colSpan={7} />
                    <th className="lft" colSpan={5} />
                    <th className="lft" colSpan={8} />
                  </tr>
                  <tr>
                    <th
                      className="sortable lft"
                      onClick={sortShips('retailCost')}
                    >
                      {translate('cost')}
                    </th>
                    <th className="sortable lft" onClick={sortShips('hullMass')}>
                      {translate('hull')}
                    </th>
                    <th className="sortable lft" onClick={sortShips('speed')}>
                      {translate('speed')}
                    </th>
                    <th className="sortable" onClick={sortShips('boost')}>
                      {translate('boost')}
                    </th>
                    <th className="sortable" onClick={sortShips('baseArmour')}>
                      {translate('armour')}
                    </th>
                    <th
                      className="sortable"
                      onClick={sortShips('baseShieldStrength')}
                    >
                      {translate('shields')}
                    </th>

                    <th className="sortable lft" onClick={sortShips('topSpeed')}>
                      {translate('speed')}
                    </th>
                    <th className="sortable" onClick={sortShips('topBoost')}>
                      {translate('boost')}
                    </th>
                    <th className="sortable" onClick={sortShips('maxJumpRange')}>
                      {translate('jump')}
                    </th>
                    <th className="sortable" onClick={sortShips('maxCargo')}>
                      {translate('cargo')}
                    </th>
                    <th className="sortable" onClick={sortShips('maxPassengers')} onMouseEnter={termtip.bind(null, 'passenger capacity')}
                      onMouseLeave={hide}>
                      {translate('pax')}
                    </th>
                    <th className="lft" colSpan={7}>
                      {translate('core module classes')}
                    </th>
                    <th
                      colSpan={5}
                      className="sortable lft"
                      onClick={sortShips('hpCount')}
                    >
                      {translate('hardpoints')}
                    </th>
                    <th
                      colSpan={8}
                      className="sortable lft"
                      onClick={sortShips('intCount')}
                    >
                      {translate('internal compartments')}
                    </th>
                  </tr>
                  <tr>
                    <th
                      className="sortable lft"
                      onClick={sortShips('retailCost')}
                    >
                      {units.CR}
                    </th>
                    <th className="sortable lft" onClick={sortShips('hullMass')}>
                      {units.T}
                    </th>
                    <th className="sortable lft" onClick={sortShips('speed')}>
                      {units['m/s']}
                    </th>
                    <th className="sortable" onClick={sortShips('boost')}>
                      {units['m/s']}
                    </th>
                    <th>&nbsp;</th>
                    <th
                      className="sortable"
                      onClick={sortShips('baseShieldStrength')}
                    >
                      {units.MJ}
                    </th>
                    <th className="sortable lft" onClick={sortShips('topSpeed')}>
                      {units['m/s']}
                    </th>
                    <th className="sortable" onClick={sortShips('topBoost')}>
                      {units['m/s']}
                    </th>
                    <th className="sortable" onClick={sortShips('maxJumpRange')}>
                      {units.LY}
                    </th>
                    <th className="sortable" onClick={sortShips('maxCargo')}>
                      {units.T}
                    </th>
                    <th>&nbsp;</th>
                    <th
                      className="sortable lft"
                      onMouseEnter={termtip.bind(null, 'power plant')}
                      onMouseLeave={hide}
                      onClick={sortShips('standard', 0)}
                    >
                      {'pp'}
                    </th>
                    <th
                      className="sortable"
                      onMouseEnter={termtip.bind(null, 'thrusters')}
                      onMouseLeave={hide}
                      onClick={sortShips('standard', 1)}
                    >
                      {'th'}
                    </th>
                    <th
                      className="sortable"
                      onMouseEnter={termtip.bind(null, 'frame shift drive')}
                      onMouseLeave={hide}
                      onClick={sortShips('standard', 2)}
                    >
                      {'fsd'}
                    </th>
                    <th
                      className="sortable"
                      onMouseEnter={termtip.bind(null, 'life support')}
                      onMouseLeave={hide}
                      onClick={sortShips('standard', 3)}
                    >
                      {'ls'}
                    </th>
                    <th
                      className="sortable"
                      onMouseEnter={termtip.bind(null, 'power distriubtor')}
                      onMouseLeave={hide}
                      onClick={sortShips('standard', 4)}
                    >
                      {'pd'}
                    </th>
                    <th
                      className="sortable"
                      onMouseEnter={termtip.bind(null, 'sensors')}
                      onMouseLeave={hide}
                      onClick={sortShips('standard', 5)}
                    >
                      {'s'}
                    </th>
                    <th
                      className="sortable"
                      onMouseEnter={termtip.bind(null, 'fuel tank')}
                      onMouseLeave={hide}
                      onClick={sortShips('standard', 6)}
                    >
                      {'ft'}
                    </th>
                    <th className="sortable lft" onClick={sortShips('hp', 1)}>
                      {translate('S')}
                    </th>
                    <th className="sortable" onClick={sortShips('hp', 2)}>
                      {translate('M')}
                    </th>
                    <th className="sortable" onClick={sortShips('hp', 3)}>
                      {translate('L')}
                    </th>
                    <th className="sortable" onClick={sortShips('hp', 4)}>
                      {translate('H')}
                    </th>
                    <th className="sortable" onClick={sortShips('hp', 0)}>
                      {translate('U')}
                    </th>

                    <th className="sortable lft" onClick={sortShips('int', 0)}>
                      1
                    </th>
                    <th className="sortable" onClick={sortShips('int', 1)}>
                      2
                    </th>
                    <th className="sortable" onClick={sortShips('int', 2)}>
                      3
                    </th>
                    <th className="sortable" onClick={sortShips('int', 3)}>
                      4
                    </th>
                    <th className="sortable" onClick={sortShips('int', 4)}>
                      5
                    </th>
                    <th className="sortable" onClick={sortShips('int', 5)}>
                      6
                    </th>
                    <th className="sortable" onClick={sortShips('int', 6)}>
                      7
                    </th>
                    <th className="sortable" onClick={sortShips('int', 7)}>
                      8
                    </th>
                  </tr>
                </thead>
                <tbody onMouseLeave={this._highlightShip.bind(this, null)}>
                  {detailRows}
                </tbody>
              </table>
            </div>
          </div>
          <div className="table-tools" >
            <label><input type="checkbox" checked={this.state.groupCompared} onClick={() => this._toggleGroupCompared()}/>Group highlighted ships</label>
          </div>
        </div>
      </div>
    );
  }
}
