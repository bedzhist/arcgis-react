import { useState } from 'react';
import { Alert, AlertProps } from '../../contexts/AlertContext';
import _ from 'lodash';

export const useAlert = () => {
  const [alert, setAlert] = useState<Alert | null>(null);

  const showErrorAlert = (errorAlert: Omit<AlertProps, 'kind'>) =>
    setAlert({ ...errorAlert, kind: 'danger', id: _.uniqueId() });
  const showSuccessAlert = (successAlert: Omit<AlertProps, 'kind'>) =>
    setAlert({ ...successAlert, kind: 'success', id: _.uniqueId() });
  const showInfoAlert = (infoAlert: Omit<AlertProps, 'kind'>) =>
    setAlert({ ...infoAlert, kind: 'info', id: _.uniqueId() });
  const showWarningAlert = (warningAlert: Omit<AlertProps, 'kind'>) =>
    setAlert({ ...warningAlert, kind: 'warning', id: _.uniqueId() });
  const showDefaultErrorAlert = () =>
    setAlert({
      id: _.uniqueId(),
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
