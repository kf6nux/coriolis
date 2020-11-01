import React from 'react';
import PropTypes from 'prop-types';
import TranslatedComponent from './TranslatedComponent';
import LineChart from '../components/LineChart';
import * as Calc from '../shipyard/Calculations';
import { calculateJumpRange } from 'ed-forge/lib/stats/JumpRangeProfile';
import { ShipProps } from 'ed-forge';
const { LADEN_MASS } = ShipProps;

/**
 * FSD profile for a given ship
 */
export default class FSDProfile extends TranslatedComponent {
  static propTypes = {
    code: PropTypes.string.isRequired,
    ship: PropTypes.object.isRequired,
    cargo: PropTypes.number.isRequired,
    fuel: PropTypes.number.isRequired,
  };

  /**
   * Calculate the maximum range for this ship across its applicable mass
   * @param  {Object}  ship          The ship
   * @param  {Object}  fuel          The fuel on the ship
   * @param  {Object}  mass          The mass at which to calculate the maximum range
   * @return {number}                The maximum range
   */
  _calcMaxRange(ship, fuel, mass) {
    // Obtain the maximum range
    return Calc.jumpRange(mass, ship.standard[2].m, Math.min(fuel, ship.standard[2].m.getMaxFuelPerJump()), ship);
  }

  /**
   * Render FSD profile
   * @return {React.Component} contents
   */
  render() {
    const { language } = this.context;
    const { translate } = language;
    const { code, ship } = this.props;

    const minMass = ship.getBaseProperty('hullmass');
    const maxMass = ship.getThrusters().get('enginemaximalmass');
    const mass = ship.get(LADEN_MASS);
    const cb = (mass) => calculateJumpRange(ship, mass, Infinity, true);
    return (
      <LineChart
        xMin={minMass}
        xMax={maxMass}
        yMin={0}
        yMax={cb(minMass)}
        // Add a mark at our current mass
        xMark={Math.min(mass, maxMass)}
        xLabel={translate('mass')}
        xUnit={translate('T')}
        yLabel={translate('maximum range')}
        yUnit={translate('LY')}
        func={cb}
        points={200}
        code={code}
        aspect={0.7}
      />
    );
  }
}
