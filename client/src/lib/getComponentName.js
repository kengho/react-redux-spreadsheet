import { BODY } from '../constants';

export default function (evt) {
  if (!evt.target || !evt.target.dataset) {
    return;
  }

  return evt.target.dataset.componentName || BODY;
}
