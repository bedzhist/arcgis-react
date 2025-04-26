import { useState } from 'react';
import { v4 } from 'uuid';
import { AlertData, AlertProps } from '../../contexts/AlertContext';

export const useAlert = () => {
  const [alert, setAlert] = useState<AlertData | null>(null);

  const showErrorAlert = (errorAlert: Omit<AlertProps, 'kind'>) =>
    setAlert({ ...errorAlert, kind: 'danger', id: v4() });
  const showSuccessAlert = (successAlert: Omit<AlertProps, 'kind'>) =>
    setAlert({ ...successAlert, kind: 'success', id: v4() });
  const showInfoAlert = (infoAlert: Omit<AlertProps, 'kind'>) =>
    setAlert({ ...infoAlert, kind: 'info', id: v4() });
  const showWarningAlert = (warningAlert: Omit<AlertProps, 'kind'>) =>
    setAlert({ ...warningAlert, kind: 'warning', id: v4() });
  const showDefaultErrorAlert = () =>
    setAlert({
      id: v4(),
      title: 'Error',
      message:
        'An error occurred. Please contact support if the problem persists.',
      icon: 'exclamation-mark-triangle',
      kind: 'danger'
    });
  const hideAlert = () => setAlert(null);

  const alertMethods = {
    hideAlert,
    showErrorAlert,
    showSuccessAlert,
    showInfoAlert,
    showWarningAlert,
    showDefaultErrorAlert
  };

  return [alert, alertMethods] as const;
};

export default useAlert;
