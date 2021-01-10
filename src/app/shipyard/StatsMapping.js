import { Module } from 'ed-forge';

/**
 * Sets a resistance value of a module as
 * @param {Module} module Module to set the property
 * @param {string} prop Property name; must end with 'resistance'
 * @param {number} val Resistance value to set
 */
function setterResToEff(module, prop, val) {
  module.set(
    prop.replace('resistance', 'effectiveness'),
    1 - val / 100,
  );
}

export const SHOW = {
  causticeffectiveness: {
    as: 'causticresistance',
    setter: setterResToEff,
  },
  explosiveeffectiveness: {
    as: 'explosiveresistance',
    setter: setterResToEff,
  },
  kineticeffectiveness: {
    as: 'kineticresistance',
    setter: setterResToEff,
  },
  thermiceffectiveness: {
    as: 'thermicresistance',
    setter: setterResToEff,
  },
};
