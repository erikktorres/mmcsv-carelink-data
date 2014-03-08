var parsing = require('../parsing.js');

var extractionSpecs = {
  'BasalProfileStart': {
    type: 'basal-rate-change',
    deliveryType: 'scheduled',
    deviceTime: parsing.extract('deviceTime'),
    scheduleName: parsing.extract(['Raw-Values', 'PATTERN_NAME']),
    value: parsing.asNumber(['Raw-Values', 'RATE']),
    deviceId: parsing.extract('Raw-Device Type')
  },
  'BolusNormal': {
    type: 'bolus',
    subType: parsing.toLower('Bolus Type'),
    deviceTime: parsing.extract('deviceTime'),
    value: parsing.asNumber('Bolus Volume Delivered (U)'),
    programmed: parsing.asNumber('Bolus Volume Selected (U)'),
    uploadId: parsing.extract('Raw-Upload ID'),
    uploadSeqNum: parsing.asNumber('Raw-Seq Num'),
    deviceId: parsing.extract('Raw-Device Type')
  },
  'BolusSquare': {
    type: 'bolus',
    subType: parsing.toLower('Bolus Type'),
    deviceTime: parsing.extract('deviceTime'),
    value: parsing.asNumber('Bolus Volume Delivered (U)'),
    programmed: parsing.asNumber('Bolus Volume Selected (U)'),
    duration: parsing.asNumber(['Raw-Values', 'DURATION']),
    uploadId: parsing.extract('Raw-Upload ID'),
    uploadSeqNum: parsing.asNumber('Raw-Seq Num'),
    deviceId: parsing.extract('Raw-Device Type')
  },
  'BolusWizardBolusEstimate': {
    type: 'wizard',
    deviceTime: parsing.extract('deviceTime'),
    uploadId: parsing.extract('Raw-Upload ID'),
    uploadSeqNum: parsing.asNumber('Raw-Seq Num'),
    deviceId: parsing.extract('Raw-Device Type'),
    payload: {
      estimate: parsing.asNumber('BWZ Estimate (U)'),
      targetLow: parsing.asNumber('BWZ Target Low BG (mg/dL)'),
      targetHigh: parsing.asNumber('BWZ Target High BG (mg/dL)'),
      carbRatio: parsing.asNumber('BWZ Carb Ratio (grams)'),
      insulinSensitivity: parsing.asNumber('BWZ Insulin Sensitivity (mg/dL)'),
      carbInput: parsing.asNumber(['Raw-Values', 'CARB_INPUT']),
      carbUnits: parsing.extract(['Raw-Values', 'CARB_UNITS']),
      bgInput: parsing.asNumber(['Raw-Values', 'BG_INPUT']),
      bgUnits: parsing.extract(['Raw-Values', 'BG_UNITS']),
      correctionEstimate: parsing.asNumber('BWZ Correction Estimate (U)'),
      foodEstimate: parsing.asNumber('BWZ Food Estimate (U)'),
      activeInsulin: parsing.asNumber('BWZ Active Insulin (U)')
    }
  },
  'GlucoseSensorData': {
    type: 'cbg',
    deviceTime: parsing.extract('deviceTime'),
    value: parsing.asNumber('Sensor Glucose (mg/dL)'),
    deviceId: parsing.extract('Raw-Device Type')
  },
  'CalBGForPH': {
    type: 'smbg',
    deviceTime: parsing.extract('deviceTime'),
    value: parsing.asNumber('Sensor Calibration BG (mg/dL)'),
    deviceId: parsing.extract('Raw-Device Type')
  },
  ChangeBolusWizardSetupConfig: {
    type: 'settings',
    subType: 'bolusWizardSetupPred',
    phase: 'start',
    deviceTime: parsing.extract('deviceTime'),
    uploadId: parsing.extract('Raw-Upload ID'),
    uploadSeqNum: parsing.asNumber('Raw-Seq Num'),
    deviceId: parsing.extract('Raw-Device Type'),
    eventId: parsing.extract('Raw-ID'),
    carbUnits: parsing.extract(['Raw-Values', 'CARB_UNITS']),
    bgUnits: parsing.map(['Raw-Values', 'BG_UNITS'], function(e) { return e === 'mg dl' ? 'mg dL' : e; })
  },
  ChangeCarbRatioPattern: {
    type: 'settings',
    subType: 'bolusWizardSetupPred',
    phase: 'carbSetup',
    deviceTime: parsing.extract('deviceTime'),
    uploadId: parsing.extract('Raw-Upload ID'),
    uploadSeqNum: parsing.asNumber('Raw-Seq Num'),
    deviceId: parsing.extract('Raw-Device Type'),
    eventId: parsing.extract('Raw-ID'),
    size: parsing.asNumber(['Raw-Values', 'SIZE'])
  },
  ChangeCarbRatio: {
    type: 'settings',
    subType: 'bolusWizardSetupPred',
    phase: 'carbRatio',
    deviceTime: parsing.extract('deviceTime'),
    uploadId: parsing.extract('Raw-Upload ID'),
    uploadSeqNum: parsing.asNumber('Raw-Seq Num'),
    deviceId: parsing.extract('Raw-Device Type'),
    setupId: parsing.extract(['Raw-Values', 'PATTERN_DATUM']),
    index: parsing.asNumber(['Raw-Values', 'INDEX']),
    payload: {
      amount: parsing.asNumber(['Raw-Values', 'AMOUNT']),
      start: parsing.asNumber(['Raw-Values', 'START_TIME'])
    }
  },
  ChangeInsulinSensitivityPattern: {
    type: 'settings',
    subType: 'bolusWizardSetupPred',
    phase: 'insulinSensitivitySetup',
    deviceTime: parsing.extract('deviceTime'),
    uploadId: parsing.extract('Raw-Upload ID'),
    uploadSeqNum: parsing.asNumber('Raw-Seq Num'),
    deviceId: parsing.extract('Raw-Device Type'),
    eventId: parsing.extract('Raw-ID'),
    size: parsing.asNumber(['Raw-Values', 'SIZE']),
    units: parsing.extract(['Raw-Values', 'ORIGINAL_UNITS'])
  },
  ChangeInsulinSensitivity: {
    type: 'settings',
    subType: 'bolusWizardSetupPred',
    phase: 'insulinSensitivity',
    deviceTime: parsing.extract('deviceTime'),
    uploadId: parsing.extract('Raw-Upload ID'),
    uploadSeqNum: parsing.asNumber('Raw-Seq Num'),
    deviceId: parsing.extract('Raw-Device Type'),
    setupId: parsing.extract(['Raw-Values', 'PATTERN_DATUM']),
    index: parsing.asNumber(['Raw-Values', 'INDEX']),
    payload: {
      amount: parsing.asNumber(['Raw-Values', 'AMOUNT']),
      start: parsing.asNumber(['Raw-Values', 'START_TIME'])
    }
  },
  ChangeBGTargetRangePattern: {
    type: 'settings',
    subType: 'bolusWizardSetupPred',
    phase: 'bgTargetSetup',
    deviceTime: parsing.extract('deviceTime'),
    uploadId: parsing.extract('Raw-Upload ID'),
    uploadSeqNum: parsing.asNumber('Raw-Seq Num'),
    deviceId: parsing.extract('Raw-Device Type'),
    eventId: parsing.extract('Raw-ID'),
    size: parsing.asNumber(['Raw-Values', 'SIZE']),
    units: parsing.extract(['Raw-Values', 'ORIGINAL_UNITS'])
  },
  ChangeBGTargetRange: {
    type: 'settings',
    subType: 'bolusWizardSetupPred',
    phase: 'bgTarget',
    deviceTime: parsing.extract('deviceTime'),
    uploadId: parsing.extract('Raw-Upload ID'),
    uploadSeqNum: parsing.asNumber('Raw-Seq Num'),
    deviceId: parsing.extract('Raw-Device Type'),
    setupId: parsing.extract(['Raw-Values', 'PATTERN_DATUM']),
    index: parsing.asNumber(['Raw-Values', 'INDEX']),
    payload: {
      low: parsing.asNumber(['Raw-Values', 'AMOUNT_LOW']),
      high: parsing.asNumber(['Raw-Values', 'AMOUNT_HIGH']),
      start: parsing.asNumber(['Raw-Values', 'START_TIME'])
    }
  },
  ChangeBolusWizardSetup: {
    type: 'settings',
    subType: 'bolusWizardSetupPred',
    phase: 'complete',
    deviceTime: parsing.extract('deviceTime'),
    uploadId: parsing.extract('Raw-Upload ID'),
    uploadSeqNum: parsing.asNumber('Raw-Seq Num'),
    deviceId: parsing.extract('Raw-Device Type'),
    nextConfigId: parsing.extract(['Raw-Values', 'NEW_CONFIG_DATUM']),
    prevConfigId: parsing.extract(['Raw-Values', 'OLD_CONFIG_DATUM'])
  },
  ChangeBasalProfilePattern: {
    type: 'settings',
    subType: 'basalScheduleConfig',
    phase: 'basalScheduleSetup',
    deviceTime: parsing.extract('deviceTime'),
    uploadId: parsing.extract('Raw-Upload ID'),
    uploadSeqNum: parsing.asNumber('Raw-Seq Num'),
    deviceId: parsing.extract('Raw-Device Type'),
    eventId: parsing.extract('Raw-ID'),
    size: parsing.asNumber(['Raw-Values', 'NUM_PROFILES']),
    scheduleName: parsing.extract(['Raw-Values', 'PATTERN_NAME'])
  },
  ChangeBasalProfile: {
    type: 'settings',
    subtype: 'basalScheduleConfig',
    phase: 'basalSchedule',
    deviceTime: parsing.extract('deviceTime'),
    uploadId: parsing.extract('Raw-Upload ID'),
    uploadSeqNum: parsing.asNumber('Raw-Seq Num'),
    deviceId: parsing.extract('Raw-Device Type'),
    setupId: parsing.extract(['Raw-Values', 'PATTERN_DATUM']),
    index: parsing.asNumber(['Raw-Values', 'PROFILE_INDEX']),
    payload: {
      rate: parsing.asNumber(['Raw-Values', 'RATE']),
      start: parsing.asNumber(['Raw-Values', 'START_TIME'])
    }
  }
};

var parserBuilder = parsing.parserBuilder();
Object.keys(extractionSpecs).forEach(function(type) {
  parserBuilder.whenFieldIs('Raw-Type', type).applyConversion(extractionSpecs[type])
});

module.exports = parserBuilder.build();
