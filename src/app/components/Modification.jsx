import React from 'react';
import PropTypes from 'prop-types';
import TranslatedComponent from './TranslatedComponent';
import cn from 'classnames';
import NumberEditor from 'react-number-editor';
import { Module } from 'ed-forge';

/**
 * Modification
 */
export default class Modification extends TranslatedComponent {
  static propTypes = {
    highlight: PropTypes.bool,
    m: PropTypes.instanceOf(Module).isRequired,
    property: PropTypes.string.isRequired,
    onSet: PropTypes.func.isRequired,
  };

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   */
  constructor(props) {
    super(props);
    const { m, property } = props;
    const { beneficial, unit, value } = m.getFormatted(property, true);
    this.state = { beneficial, unit, value };
  }

  /**
   * Notify listeners that a new value has been entered and commited.
   */
  _updateFinished() {
    const { onSet, m, property } = this.props;
    const { inputValue } = this.state;
    const numValue = Number(inputValue);
    if (!isNaN(numValue) && this.state.value !== numValue) {
      onSet(property, numValue);
      const { beneficial, unit, value } = m.getFormatted(property, true);
      this.setState({ beneficial, unit, value });
    }
  }

  /**
   * Render the modification
   * @return {React.Component} modification
   */
  render() {
    const { translate, formats } = this.context.language;
    const { highlight, m, property } = this.props;
    const { beneficial, unit, value, inputValue } = this.state;

    // Some features only apply to specific modules; these features will be
    // undefined on items that do not belong to the same class. Filter these
    // features here
    if (value === undefined) {
      return null;
    }

    return (
      <div onBlur={this._updateFinished.bind(this)} key={property}
        className="cb modification-container"
      >
        <span className="cb">{translate(property)}</span>
        <span className="header-adjuster"></span>
        <table style={{ width: '100%' }}>
          <tbody>
            <tr>
              <td className="input-container">
                <span>
                  <NumberEditor value={inputValue || value} stepModifier={1}
                    decimals={2} step={0.01} style={{ textAlign: 'right' }}
                    className={cn('cb', { 'greyed-out': !highlight })}
                    onKeyDown={(event) => {
                      if (event.key == 'Enter') {
                        this._updateFinished();
                        event.stopPropagation();
                      }
                    }}
                    onValueChange={(inputValue) => {
                      if (inputValue.length <= 15) {
                        this.setState({ inputValue });
                      }
                    }} />
                  <span className="unit-container">{unit}</span>
                </span>
              </td>
              <td style={{ textAlign: 'center' }}
                className={cn({
                  secondary: beneficial,
                  warning: beneficial === false,
                })}
              // TODO: support absolute modifiers
              >{formats.pct(m.getModifier(property))}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}
