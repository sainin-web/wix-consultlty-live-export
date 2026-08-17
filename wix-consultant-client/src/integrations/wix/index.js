/**
 * Wix integration exports
 * All Wix-related functionality in one place
 */

export { WIX_ENVIRONMENT, isAllowedOrigin, getAllowedParentOrigin } from './wixEnvironment';
export { wixBridge } from './wixBridge';
export { widgetModeManager, useWidgetMode } from './wixWidgetModes';
export { wixResizer, useWixResize } from './wixResize';

// For convenience, export the package as a namespace
import * as environment from './wixEnvironment';
import * as bridge from './wixBridge';
import * as modes from './wixWidgetModes';
import * as resize from './wixResize';

export const WixIntegration = {
  environment,
  bridge,
  modes,
  resize,
};
