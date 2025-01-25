export default {
  nav: {
    home: '主页',
    settings: '设置',
    report: '报告'
  },
  home: {
    title: '视觉训练',
    startTraining: '开始训练',
    viewReport: '查看报告',
    settings: '设置',
    lastTraining: '上次训练时间：{time}',
    totalSessions: '总训练次数',
    averageAccuracy: '平均准确率',
    averageQuality: '平均训练质量',
    trainingTooSoon: '距离上次训练还不到8小时，请在{hours}小时后再试',
    startTest: '开始测试模式',
    testModeEnabled: '测试模式已启用',
    selectTestMode: '选择测试模式',
    testModeDesc: '测试模式每个单元包含5次训练',
    clearHistory: '清除历史',
    confirmClearHistory: '确定要清除所有训练历史记录吗？此操作无法撤销。',
    quality: '训练质量',
    retry: '重新训练'
  },
  training: {
    title: '视觉训练',
    startUnit: '开始本单元训练',
    exitConfirm: '确定要退出训练吗？',
    unit: '单元 {current}/{total}',
    trial: '试验 {current}/{total}',
    unitProgress: {
      title: '训练进度',
      status: '当前单元：{current}/{total}'
    },
    modes: {
      single_image: {
        title: '单图训练',
        description: '屏幕会闪烁两次，判断哪一次闪烁中出现了 Gabor 视标。如果是第一次，请按左键或左箭头；如果是第二次，请按右键或右箭头。'
      },
      three_image: {
        title: '三图训练',
        description: '屏幕会闪烁两次，每次显示三个位置的视标。判断中间位置的视标在哪一次闪烁中出现。如果是第一次，请按左键或左箭头；如果是第二次，请按右键或右箭头。'
      },
      clear_image: {
        title: '清晰图像训练',
        description: '屏幕会闪烁两次，每次都会显示一个视标，但清晰度不同。判断哪一次闪烁中的视标更清晰。如果是第一次，请按左键或左箭头；如果是第二次，请按右键或右箭头。'
      },
      shift_image: {
        title: '移图训练',
        description: '屏幕会闪烁一次，显示三个视标。判断中间的视标相对于原位置的偏移方向。如果是向左或向上偏移，请按左键或左箭头；如果是向右或向下偏移，请按右键或右箭头。'
      },
      crowding: {
        title: '拥挤训练',
        description: '屏幕会闪烁两次，显示由E字形成的阵列。如果第一次中间有E字，请按左箭头；如果第二次中间有E字，请按右箭头。'
      },
      mixed: {
        title: '混合训练',
        description: '混合多种训练模式'
      }
    },
    keyHints: {
      left: '左键/左箭头：选择第一次闪烁',
      right: '右键/右箭头：选择第二次闪烁',
      middle: '中键/上箭头：开始下一次试验',
      escape: 'ESC：退出训练'
    },
    controls: {
      title: '操作说明',
      mouse: '鼠标控制：',
      keyboard: '键盘控制：',
      mouseLeft: '左键 - 选择第一次闪烁',
      mouseRight: '右键 - 选择第二次闪烁',
      mouseMiddle: '中键 - 开始下一次试验',
      keyLeft: '←键 - 选择第一次闪烁',
      keyRight: '→键 - 选择第二次闪烁',
      keyUp: '↑键 - 开始下一次试验',
      keyEsc: 'ESC键 - 退出训练'
    },
    unitSummary: {
      title: '单元总结',
      accuracy: '正确率',
      stability: '稳定性',
      quality: '训练质量',
      averageReactionTime: '平均反应时间',
      difficultyLevel: '难度等级',
      size: '大小',
      contrast: '对比度',
      spacing: '间距',
      nextUnit: '下一单元',
      finish: '完成训练'
    },
    testMode: '测试模式',
    modeProbabilities: {
      title: '训练模式概率设置',
      singleImage: '单图训练概率',
      threeImage: '三图训练概率',
      clearImage: '清晰图像训练概率',
      shiftImage: '移图训练概率',
      crowding: '拥挤训练概率',
      total: '总概率'
    }
  },
  report: {
    title: '训练报告',
    noData: '暂无训练记录',
    retry: '重新训练',
    totalSessions: '总训练次数',
    averageAccuracy: '平均正确率',
    averageReactionTime: '平均反应时间',
    progressTrend: '进步趋势',
    recommendations: '建议',
    recentSessions: '最近训练记录',
    date: '训练时间',
    mode: '训练模式',
    quality: '训练质量',
    accuracy: '正确率',
    stability: '稳定性',
    reactionTime: '反应时间',
    size: '视标大小',
    contrast: '对比度',
    flashRate: '闪烁间隔',
    spacing: '间距系数',
    shift: '偏移量',
    contrastDiff: '对比度差异',
    showDetails: '显示单元详情',
    hideDetails: '隐藏单元详情',
    showChart: '显示趋势图',
    hideChart: '隐藏趋势图',
    clearHistory: '清除所有记录',
    delete: '删除',
    actions: '操作',
    confirmClearHistory: '确定要清除所有训练记录吗？',
    confirmDeleteRecord: '确定要删除这条训练记录吗？'
  },
  settings: {
    title: '设置',
    resetSection: '重置此部分',
    resetAll: '重置所有设置',
    confirmResetSection: '确定要重置此部分设置吗？',
    confirmResetAll: '确定要重置所有设置吗？',
    
    feedback: {
      title: '反馈设置',
      visual: {
        title: '视觉反馈',
        enabled: '启用视觉反馈',
        correctColor: '正确颜色',
        incorrectColor: '错误颜色'
      },
      audio: {
        title: '声音反馈',
        enabled: '启用声音反馈',
        correctSound: '正确提示音',
        incorrectSound: '错误提示音'
      }
    },
    
    training: {
      title: '训练设置',
      unitsCount: '训练单元数量',
      trialsPerUnit: '每单元试验次数',
      flashRate: '闪烁间隔（毫秒）',
      modeProbabilities: {
        title: '训练模式概率',
        singleImage: '单图训练',
        threeImage: '三图训练',
        clearImage: '清晰图像训练',
        shiftImage: '移图训练',
        crowding: '拥挤训练',
        total: '总概率'
      }
    },

    display: {
      title: '显示设置',
      showUnitCounter: '显示单元计数',
      showTrialCounter: '显示试验计数',
      showPerformanceMetrics: '显示性能指标'
    }
  },
  common: {
    back: '返回',
    cancel: '取消'
  },
  selectMode: {
    title: '选择训练模式',
    modes: {
      single: {
        title: '单图训练',
        description: '通过判断单个视标的出现时机来训练视觉敏感度'
      },
      triple: {
        title: '三图训练',
        description: '通过判断三个视标中的变化来训练视觉分辨能力'
      },
      clarity: {
        title: '清晰度训练',
        description: '通过比较视标的清晰度来训练视觉辨别能力'
      },
      movement: {
        title: '移图训练',
        description: '通过判断视标的移动方向来训练动态视觉能力'
      },
      crowding: {
        title: '拥挤训练',
        description: '通过识别拥挤环境中的目标来训练视觉注意力'
      },
      title: '选择训练模式',
      SINGLE_IMAGE: '单图训练',
      THREE_IMAGE: '三图训练',
      CLEAR_IMAGE: '清晰度训练',
      SHIFT_IMAGE: '位移训练',
      CROWDING: '拥挤训练',
      descriptions: {
        SINGLE_IMAGE: '训练基础的视觉辨识能力',
        THREE_IMAGE: '训练视觉注意力和空间分辨能力',
        CLEAR_IMAGE: '训练对不同清晰度图像的识别能力',
        SHIFT_IMAGE: '训练对位移图像的识别能力',
        CROWDING: '训练在视觉拥挤环境下的识别能力'
      }
    }
  }
}; 