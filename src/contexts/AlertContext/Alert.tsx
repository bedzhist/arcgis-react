import { AlertData } from '../../contexts/AlertContext';

interface AlertProps {
  data: AlertData | null;
  onClose: () => void;
}

export function Alert(props: AlertProps) {
  return (
    <calcite-alert
      slot="alerts"
      icon={props.data?.icon}
      kind={props.data?.kind}
      open={!!props.data}
      label={props.data?.title || ''}
      oncalciteAlertClose={props.onClose}
    >
      <div slot="title">{props.data?.title}</div>
      <div slot="message">{props.data?.message}</div>
    </calcite-alert>
  );
}

export default Alert;
