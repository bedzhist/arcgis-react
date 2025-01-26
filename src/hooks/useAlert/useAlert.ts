import { useState } from 'react';
import { Alert } from '../../contexts/AlertContext';

export const useAlert = () => {
  const [alert, setAlert] = useState<Alert | null>(null);

  const showErrorAlert = (errorAlert: Omit<Alert, 'kind'>) =>
    setAlert({ ...errorAlert, kind: 'danger' });
  const showSuccessAlert = (successAlert: Omit<Alert, 'kind'>) =>
    setAlert({ ...successAlert, kind: 'success' });
  const showInfoAlert = (infoAlert: Omit<Alert, 'kind'>) =>
    setAlert({ ...infoAlert, kind: 'info' });
  const showWarningAlert = (warningAlert: Omit<Alert, 'kind'>) =>
    setAlert({ ...warningAlert, kind: 'warning' });
  const showDefaultErrorAlert = () =>
    setAlert({
      title: 'Error',
      message:
        'An error occurred. Please contact support if the problem persists.',
      icon: 'exclamation-mark-triangle',
      kind: 'danger'
    });
  const alertMethods = {
    setAlert,
    showErrorAlert,
    showSuccessAlert,
    showInfoAlert,
    showWarningAlert,
    showDefaultErrorAlert
  };

  return [alert, alertMethods] as const;
};

export default useAlert;
