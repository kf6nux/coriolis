import React from 'react';
import SlotSection from './SlotSection';
import Slot from './Slot';
import { MountFixed, MountGimballed, MountTurret } from '../components/SvgIcons';
import { stopCtxPropagation } from '../utils/UtilityFunctions';
import autoBind from 'auto-bind';

/**
 * Hardpoint slot section
 */
export default class HardpointSlotSection extends SlotSection {
  /**
   * Constructor
   * @param  {Object} props   React Component properties
   */
  constructor(props) {
    super(props, 'hardpoints');
    autoBind(this);
  }

  /**
   * Empty all slots
   */
  _empty() {
    // TODO:
    // this.props.ship.emptyWeapons();
    this._close();
  }

  /**
   * Fill slots with specified module
   * @param  {string} group           Group name
   * @param  {string} mount           Mount Type - F, G, T
   * @param  {SyntheticEvent} event   Event
   */
  _fill(group, mount, event) {
    // TODO:
    // this.props.ship.useWeapon(group, mount, null, event.getModifierState('Alt'));
    this._close();
  }

  /**
   * Empty all on section header right click
   */
  _contextMenu() {
    this._empty();
  }

  /**
   * Generate the slot React Components
   * @return {Array} Array of Slots
   */
  _getSlots() {
    let { ship, currentMenu, propsToShow, onPropToggle } = this.props;
    let { originSlot, targetSlot } = this.state;
    let slots = [];

    for (let h of ship.getHardpoints(undefined, true)) {
      slots.push(<Slot
        key={h.object.Slot}
        maxClass={h.getSize()}
        currentMenu={currentMenu}
        drag={this._drag.bind(this, h)}
        dragOver={this._dragOverSlot.bind(this, h)}
        drop={this._drop}
        dropClass={this._dropClass(h, originSlot, targetSlot)}
        m={h}
        enabled={h.enabled ? true : false}
        propsToShow={propsToShow}
        onPropToggle={onPropToggle}
      />);
    }

    return slots;
  }

  /**
   * Generate the section drop-down menu
   * @param  {Function} translate Translate function
   * @return {React.Component}    Section menu
   */
  _getSectionMenu() {
    const { translate } = this.context.language;
    let _fill = this._fill;

    return <div className='select hardpoint' onClick={(e) => e.stopPropagation()} onContextMenu={stopCtxPropagation}>
      <ul>
        <li className='lc' tabIndex="0" onClick={this._empty} ref={smRef => this.sectionRefArr['emptyall'] = smRef}>{translate('empty all')}</li>
        <li className='optional-hide' style={{ textAlign: 'center', marginTop: '1em' }}>{translate('PHRASE_ALT_ALL')}</li>
      </ul>
      <div className='select-group cap'>{translate('pl')}</div>
      <ul>
        <li className="c" tabIndex="0" onClick={_fill.bind(this, 'pl', 'F')}><MountFixed className='lg'/></li>
        <li className="c" tabIndex="0" onClick={_fill.bind(this, 'pl', 'G')}><MountGimballed className='lg'/></li>
        <li className="c" tabIndex="0" onClick={_fill.bind(this, 'pl', 'T')}><MountTurret className='lg'/></li>
      </ul>
      <div className='select-group cap'>{translate('ul')}</div>
      <ul>
        <li className="c" tabIndex="0" onClick={_fill.bind(this, 'ul', 'F')}><MountFixed className='lg'/></li>
        <li className="c" tabIndex="0" onClick={_fill.bind(this, 'ul', 'G')}><MountGimballed className='lg'/></li>
        <li className="c" tabIndex="0" onClick={_fill.bind(this, 'ul', 'T')}><MountTurret className='lg'/></li>
      </ul>
      <div className='select-group cap'>{translate('bl')}</div>
      <ul>
        <li className="c" tabIndex="0" onClick={_fill.bind(this, 'bl', 'F')}><MountFixed className='lg'/></li>
        <li className="c" tabIndex="0" onClick={_fill.bind(this, 'bl', 'G')}><MountGimballed className='lg'/></li>
        <li className="c" tabIndex="0" onClick={_fill.bind(this, 'bl', 'T')}><MountTurret className='lg'/></li>
      </ul>
      <div className='select-group cap'>{translate('mc')}</div>
      <ul>
        <li className="c" tabIndex="0" onClick={_fill.bind(this, 'mc', 'F')}><MountFixed className='lg'/></li>
        <li className="c" tabIndex="0" onClick={_fill.bind(this, 'mc', 'G')}><MountGimballed className='lg'/></li>
        <li className="c" tabIndex="0" onClick={_fill.bind(this, 'mc', 'T')}><MountTurret className='lg'/></li>
      </ul>
      <div className='select-group cap'>{translate('c')}</div>
      <ul>
        <li className="c" tabIndex="0" onClick={_fill.bind(this, 'c', 'F')}><MountFixed className='lg'/></li>
        <li className="c" tabIndex="0" onClick={_fill.bind(this, 'c', 'G')}><MountGimballed className='lg'/></li>
        <li className="c" tabIndex="0" onClick={_fill.bind(this, 'c', 'T')}><MountTurret className='lg'/></li>
      </ul>
      <div className='select-group cap'>{translate('fc')}</div>
      <ul>
        <li className="c" tabIndex="0" onClick={_fill.bind(this, 'fc', 'F')}><MountFixed className='lg'/></li>
        <li className="c" tabIndex="0" onClick={_fill.bind(this, 'fc', 'G')}><MountGimballed className='lg'/></li>
        <li className="c" tabIndex="0" onClick={_fill.bind(this, 'fc', 'T')}><MountTurret className='lg'/></li>
      </ul>
      <div className='select-group cap'>{translate('pa')}</div>
      <ul>
        <li className='lc' tabIndex="0"  onClick={_fill.bind(this, 'pa', 'F')}>{translate('pa')}</li>
      </ul>
      <div className='select-group cap'>{translate('rg')}</div>
      <ul>
        <li className='lc' tabIndex="0"  onClick={_fill.bind(this, 'rg', 'F')}>{translate('rg')}</li>
      </ul>
      <div className='select-group cap'>{translate('nl')}</div>
      <ul>
        <li className='lc' tabIndex="0" onClick={_fill.bind(this, 'nl', 'F')}>{translate('nl')}</li>
      </ul>
      <div className='select-group cap'>{translate('rfl')}</div>
      <ul>
        <li className="c" tabIndex="0" onClick={_fill.bind(this, 'rfl', 'F')}><MountFixed className='lg'/></li>
        <li className="c" tabIndex="0" onClick={_fill.bind(this, 'rfl', 'T')}><MountTurret className='lg'/></li>
      </ul>
    </div>;
  }
}
