const handleModeSelect = async (mode: string) => {
  const trainingStore = useTrainingStore();

  // 检查是否有未完成的训练
  if (trainingStore.currentSession) {
    const shouldOverwrite = await new Promise<boolean>(resolve => {
      const result = confirm(t('common.confirmSwitchModeNew'));
      resolve(result);
    });

    if (!shouldOverwrite) {
      return;
    }

    // 清除当前会话
    trainingStore.clearCurrentSession();
  }

  // 设置新的训练模式
  trainingStore.setTrainingMode(mode);

  // 初始化新的训练会话
  trainingStore.initializeSession();

  // 跳转到训练页面
  router.push('/training');
};
