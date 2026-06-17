export default {
  nav: {
    home: 'Home',
    settings: 'Settings',
    report: 'Report'
  },
  home: {
    title: 'Visual Training',
    startTraining: 'Start Training',
    viewReport: 'View Report',
    settings: 'Settings',
    lastTraining: 'Last training: {time}',
    totalSessions: 'Total Sessions',
    averageAccuracy: 'Average Accuracy',
    averageQuality: 'Average Quality',
    trainingTooSoon: 'Less than 8 hours since last training. Please wait {hours} hours.',
    startTest: 'Start Test Mode',
    testModeEnabled: 'Test Mode Enabled',
    selectTestMode: 'Select Test Mode',
    testModeDesc: 'Test mode includes 5 trials per unit',
    clearHistory: 'Clear History',
    confirmClearHistory: 'Are you sure you want to clear all training history? This action cannot be undone.',
    quality: 'Training Quality',
    retry: 'Retrain'
  },
  training: {
    title: 'Visual Training',
    startUnit: 'Start Current Unit',
    exitConfirm: 'Are you sure you want to exit training?',
    unit: 'Unit {current}/{total}',
    trial: 'Trial {current}/{total}',
    unitProgress: {
      title: 'Training Progress',
      status: 'Current Unit: {current}/{total}'
    },
    modes: {
      single_image: {
        title: 'Single Image Training',
        description: 'The screen will flash twice. Determine which flash contained the Gabor patch. If it appeared in the first flash, press left button or left arrow. If it appeared in the second flash, press right button or right arrow.'
      },
      three_image: {
        title: 'Three Image Training',
        description: 'The screen will flash twice, each time showing three patches. Determine which flash showed the Gabor patch in the middle position. If it appeared in the first flash, press left button or left arrow. If it appeared in the second flash, press right button or right arrow.'
      },
      clear_image: {
        title: 'Clarity Training',
        description: 'The screen will flash twice, each showing a Gabor patch with different clarity. Determine which flash showed the clearer patch. If it was the first flash, press left button or left arrow. If it was the second flash, press right button or right arrow.'
      },
      shift_image: {
        title: 'Shift Training',
        description: 'The screen will flash once, showing three patches. Determine the shift direction of the middle patch relative to its original position. If it shifted left or up, press left button or left arrow. If it shifted right or down, press right button or right arrow.'
      },
      crowding: {
        title: 'Crowding Training',
        description: 'The screen will flash twice, showing an array of E patterns. If the middle contains an E in the first flash, press left arrow. If the middle contains an E in the second flash, press right arrow.'
      },
      mixed: {
        title: 'Mixed Training',
        description: 'A mix of multiple training modes'
      }
    },
    keyHints: {
      left: 'Left button / Left arrow: Select first flash',
      right: 'Right button / Right arrow: Select second flash',
      middle: 'Middle button / Up arrow: Start next trial',
      escape: 'ESC: Exit training'
    },
    controls: {
      title: 'Controls',
      mouse: 'Mouse Controls:',
      keyboard: 'Keyboard Controls:',
      mouseLeft: 'Left click - Select first flash',
      mouseRight: 'Right click - Select second flash',
      mouseMiddle: 'Middle click - Start next trial',
      keyLeft: '← Key - Select first flash',
      keyRight: '→ Key - Select second flash',
      keyUp: '↑ Key - Start next trial',
      keyEsc: 'ESC Key - Exit training'
    },
    unitSummary: {
      title: 'Unit Summary',
      accuracy: 'Accuracy',
      stability: 'Stability',
      quality: 'Training Quality',
      averageReactionTime: 'Average Reaction Time',
      difficultyLevel: 'Difficulty Level',
      size: 'Size',
      contrast: 'Contrast',
      spacing: 'Spacing',
      nextUnit: 'Next Unit',
      finish: 'Finish Training'
    },
    testMode: 'Test Mode',
    modeProbabilities: {
      title: 'Training Mode Probabilities',
      singleImage: 'Single Image Probability',
      threeImage: 'Three Image Probability',
      clearImage: 'Clear Image Probability',
      shiftImage: 'Shift Image Probability',
      crowding: 'Crowding Probability',
      total: 'Total Probability'
    }
  },
  report: {
    title: 'Training Report',
    noData: 'No training records yet',
    retry: 'Retrain',
    totalSessions: 'Total Sessions',
    averageAccuracy: 'Average Accuracy',
    averageReactionTime: 'Average Reaction Time',
    progressTrend: 'Progress Trend',
    recommendations: 'Recommendations',
    recentSessions: 'Recent Training Sessions',
    date: 'Training Date',
    mode: 'Training Mode',
    quality: 'Training Quality',
    accuracy: 'Accuracy',
    stability: 'Stability',
    reactionTime: 'Reaction Time',
    size: 'Patch Size',
    contrast: 'Contrast',
    flashRate: 'Flash Interval',
    spacing: 'Spacing Factor',
    shift: 'Shift Amount',
    contrastDiff: 'Contrast Difference',
    showDetails: 'Show Unit Details',
    hideDetails: 'Hide Unit Details',
    showChart: 'Show Trend Chart',
    hideChart: 'Hide Trend Chart',
    clearHistory: 'Clear All Records',
    delete: 'Delete',
    actions: 'Actions',
    confirmClearHistory: 'Are you sure you want to clear all training records?',
    confirmDeleteRecord: 'Are you sure you want to delete this training record?'
  },
  settings: {
    title: 'Settings',
    resetSection: 'Reset This Section',
    resetAll: 'Reset All Settings',
    confirmResetSection: 'Are you sure you want to reset this section?',
    confirmResetAll: 'Are you sure you want to reset all settings?',

    feedback: {
      title: 'Feedback Settings',
      visual: {
        title: 'Visual Feedback',
        enabled: 'Enable Visual Feedback',
        correctColor: 'Correct Color',
        incorrectColor: 'Incorrect Color'
      },
      audio: {
        title: 'Audio Feedback',
        enabled: 'Enable Audio Feedback',
        correctSound: 'Correct Sound',
        incorrectSound: 'Incorrect Sound'
      }
    },

    training: {
      title: 'Training Settings',
      unitsCount: 'Number of Training Units',
      trialsPerUnit: 'Trials per Unit',
      flashRate: 'Flash Interval (ms)',
      modeProbabilities: {
        title: 'Training Mode Probabilities',
        singleImage: 'Single Image',
        threeImage: 'Three Image',
        clearImage: 'Clear Image',
        shiftImage: 'Shift Image',
        crowding: 'Crowding',
        total: 'Total Probability'
      }
    },

    display: {
      title: 'Display Settings',
      showUnitCounter: 'Show Unit Counter',
      showTrialCounter: 'Show Trial Counter',
      showPerformanceMetrics: 'Show Performance Metrics'
    }
  },
  common: {
    back: 'Back',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    finish: 'Finish',
    continue: 'Continue',
    resumeTraining: 'Resume Training',
    deleteTraining: 'Delete Training',
    sessionInfo: 'Session Info',
    trainingType: 'Training Type',
    startTime: 'Start Time',
    currentProgress: 'Current Progress',
    confirmDeleteSession: 'Are you sure you want to delete the current training progress?',
    confirmSwitchMode: 'You have an unfinished training session. Switching training modes will lose current progress. Continue?',
    confirmExitTraining: 'Are you sure you want to exit the current training?',
    confirmRetryTraining: 'You have an unfinished training session. Retraining will lose current progress. Continue?',
    confirmSwitchModeNew: 'You have an unfinished training session. Switch to a new training mode?\nCurrent progress will be overwritten.',
    completedUnits: 'Completed Units',
    nextUnitType: 'Next Unit Type',
    difficultyParams: 'Difficulty Parameters',
    patchSize: 'Patch Size',
    contrast: 'Contrast',
    spacingFactor: 'Spacing Factor',
    shiftRange: 'Shift Range',
    contrastDiff: 'Contrast Difference',
    expandChart: 'Expand Chart',
    collapseChart: 'Collapse Chart',
    trainingQualityLabel: 'Training Quality (%)',
    trainingIndexAndDate: 'Training Index & Date',
    accuracyLabel: 'Accuracy',
    stabilityLabel: 'Stability',
    avgReactionTimeLabel: 'Avg Reaction Time',
    flashIntervalLabel: 'Flash Interval',
    patchSizeLabel: 'Patch Size',
    contrastLabel: 'Contrast',
    spacingFactorLabel: 'Spacing Factor',
    shiftAmountLabel: 'Shift Amount',
    contrastDiffLabel: 'Contrast Difference',
    sessionTraining: 'Training Session',
    gaborTraining: 'Gabor Training',
    trainingMode: 'Training Mode',
    selectTrainingMode: 'Select Training Mode'
  },
  selectMode: {
    title: 'Select Training Mode',
    modes: {
      single: {
        title: 'Single Image Training',
        description: 'Train visual sensitivity by identifying when a single Gabor patch appears'
      },
      triple: {
        title: 'Three Image Training',
        description: 'Train visual discrimination by detecting changes among three patches'
      },
      clarity: {
        title: 'Clarity Training',
        description: 'Train visual discrimination by comparing patch clarity'
      },
      movement: {
        title: 'Movement Training',
        description: 'Train dynamic vision by judging patch movement direction'
      },
      crowding: {
        title: 'Crowding Training',
        description: 'Train visual attention by identifying targets in crowded environments'
      },
      title: 'Select Training Mode',
      SINGLE_IMAGE: 'Single Image',
      THREE_IMAGE: 'Three Image',
      CLEAR_IMAGE: 'Clarity Training',
      SHIFT_IMAGE: 'Shift Training',
      CROWDING: 'Crowding Training',
      descriptions: {
        SINGLE_IMAGE: 'Train basic visual recognition',
        THREE_IMAGE: 'Train visual attention and spatial discrimination',
        CLEAR_IMAGE: 'Train recognition of images at different clarity levels',
        SHIFT_IMAGE: 'Train recognition of shifted images',
        CROWDING: 'Train recognition in visually crowded environments'
      }
    }
  }
};
