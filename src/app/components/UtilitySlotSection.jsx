import React from 'react';
import SlotSection from './SlotSection';
import Slot from './Slot';
import { stopCtxPropagation } from '../utils/UtilityFunctions';
import autoBind from 'auto-bind';

/**
 * Utility Slot Section
 */
export default class UtilitySlotSection extends SlotSection {
  /**
   * Constructor
   * @param  {Object} props   React Component properties
   */
  constructor(props) {
    super(props, 'utility mounts');
    autoBind(this);
  }

  /**
   * Empty all utility slots and close the menu
   */
  _empty() {
    this.props.ship.emptyUtility();
    this.props.onChange();
    this._close();
  }

  /**
   * Mount module in utility slot, replace all if Alt is held
   * @param  {string} group  Module Group name
   * @param  {string} rating Module Rating
   * @param  {string} name   Module name
   * @param  {Synthetic} event  Event
   */
  _use(group, rating, name, event) {
    this.props.ship.useUtility(group, rating, name, event.getModifierState('Alt'));
    this.props.onChange();
    this._close();
  }

  /**
   * Empty all utility slots on right-click
   */
  _contextMenu() {
    this._empty();
  }

  /**
   * Create all HardpointSlots (React component) for the slots
   * @return {Array} Array of HardpointSlots
   */
  _getSlots() {
    let slots = [];
    let { ship, currentMenu, propsToShow, onPropToggle } = this.props;
    let { originSlot, targetSlot } = this.state;

    for (let h of ship.getUtilities(undefined, true)) {
      slots.push(<Slot
        key={h.object.Slot}
        maxClass={h.getSize()}
        onChange={this.props.onChange}
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
   * Generate the section menu
   * @param  {Function} translate Translate function
   * @return {React.Component}   Section menu
   */
  _getSectionMenu() {
    const { translate } = this.context.language;
    let _use = this._use;

    return <div className='select' onClick={(e) => e.stopPropagation()} onContextMenu={stopCtxPropagation}>
      <ul>
        <li className='lc' tabIndex='0' onClick={this._empty}>{translate('empty all')}</li>
        <li className='optional-hide' style={{ textAlign: 'center', marginTop: '1em' }}>{translate('PHRASE_ALT_ALL')}</li>
      </ul>
      <div className='select-group cap'>{translate('sb')}</div>
      <ul>
        <li className='c' tabIndex='0' onClick={_use.bind(this, 'sb', 'A', null)}>A</li>
        <li className='c' tabIndex='0' onClick={_use.bind(this, 'sb', 'B', null)}>B</li>
        <li className='c' tabIndex='0' onClick={_use.bind(this, 'sb', 'C', null)}>C</li>
        <li className='c' tabIndex='0' onClick={_use.bind(this, 'sb', 'D', null)}>D</li>
        <li className='c' tabIndex='0' onClick={_use.bind(this, 'sb', 'E', null)}>E</li>
      </ul>
      <div className='select-group cap'>{translate('hs')}</div>
      <ul>
        <li className='lc' tabIndex='0' onClick={_use.bind(this, 'hs', null, 'Heat Sink Launcher')}>{translate('Heat Sink Launcher')}</li>
      </ul>
      <div className='select-group cap'>{translate('ch')}</div>
      <ul>
        <li className='lc' tabIndex='0' onClick={_use.bind(this, 'ch', null, 'Chaff Launcher')}>{translate('Chaff Launcher')}</li>
      </ul>
      <div className='select-group cap'>{translate('po')}</div>
      <ul>
        <li className='lc' tabIndex='0' onClick={_use.bind(this, 'po', null, 'Point Defence')}>{translate('Point Defence')}</li>
      </ul>
    </div>;
  }
}
