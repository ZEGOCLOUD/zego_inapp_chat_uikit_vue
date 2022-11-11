// DIFF_MODULE:UI_Utils
import bus from './bus';
export const toastOperation = (
  type: boolean,
  toastData?: {
    text: string;
    textVariable?: any;
    type: string;
    duration?: boolean;
  },
): void => {
  bus.emit('toastOperation', type, toastData);
};
export const dialogOperation = (
  type: boolean,
  dialogData?: {
    title?: string;
    desc: string;
    cancelText?: string;
    confirmText?: string;
    hasCloseBtn: boolean;
    confirmFunc?: any;
    cancelFunc?: any;
  },
): void => {
  bus.emit('dialogOperation', type, dialogData);
};

export const groupUIOperation = (type?: string): void => {
  bus.emit('groupUIOperation', type);
};

export const expressionBoxOperation = (type: string): void => {
  bus.emit('expressionBoxOperation', type);
};

export const rightClickDialogOperation = (
  type: boolean,
  data?: {
    x: number;
    y: number;
    conversationItem?: any;
    messageItem?: any;
  },
): void => {
  bus.emit('rightClickDialogOperation', type, data);
};
