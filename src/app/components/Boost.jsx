import React from 'react';
import PropTypes from 'prop-types';
import TranslatedComponent from './TranslatedComponent';
import autoBind from 'auto-bind';

/**
 * Boost displays a boost button that toggles bosot
 * Requires an onChange() function of the form onChange(boost) which is triggered whenever the boost changes.
 */
export default class Boost extends TranslatedComponent {
  static propTypes = {
    boost: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired
  };

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   * @param  {Object} context   React Component context
   */
  constructor(props) {
    super(props);
    autoBind(this);
  }

  /**
   * Add listeners after mounting
   */
  componentDidMount() {
    document.addEventListener('keydown', this._keyDown);
  }

  /**
   * Remove listeners before unmounting
   */
  componentWillUnmount() {
    document.removeEventListener('keydown', this._keyDown);
  }

  /**
   * Handle Key Down
   * @param  {Event} e  Keyboard Event
   */
  _keyDown(e) {
    if (e.ctrlKey || e.metaKey) { // CTRL/CMD
      switch (e.keyCode) {
        case 66:     // b == boost
          if (this.props.ship.canBoost()) {
            e.preventDefault();
            this._toggleBoost();
          }
          break;
      }
    }
  }

  /**
   * Toggle the boost feature
   */
  _toggleBoost() {
    this.props.onChange(!this.props.boost);
  }

  /**
   * Render boost
   * @return {React.Component} contents
   */
  render() {
    const { translate } = this.context.language;
    return (
      <span id='boost'>
        <button id='boost' className={this.props.boost ? 'selected' : null} onClick={this._toggleBoost}>
          {translate('boost')}
        </button>
      </span>
    );
  }
}
