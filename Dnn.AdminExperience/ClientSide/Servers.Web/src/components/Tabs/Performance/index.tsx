import React, { useEffect, useRef } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  GridSystem,
  GridCell,
  InputGroup,
  Button,
  Label,
} from "@dnnsoftware/dnn-react-common";
import RadioButtonBlock from "../../common/RadioButtonBlock";
import DropdownBlock from "../../common/DropdownBlock";
import InfoBlock from "../../common/InfoBlock";
import SwitchBlock from "../../common/SwitchBlock";
import WarningBlock from "../../common/WarningBlock";
import localization from "../../../localization";
import PerformanceTabActions from "../../../actions/performanceTab";
import utils from "../../../utils";

interface ISelectOption {
  label: string;
  value: string;
}

interface IPerformanceSettings {
  portalName: string;
  cachingProvider: string;
  pageStatePersistence: string;
  moduleCacheProvider: string;
  pageCacheProvider: string;
  cacheSetting: string;
  authCacheability: string;
  unauthCacheability: string;
  sslForCacheSynchronization: boolean;
  clientResourcesManagementMode: string;
  currentHostVersion: number;
  hostEnableCompositeFiles: boolean;
  hostMinifyCss: boolean;
  hostMinifyJs: boolean;
  currentPortalVersion: number;
  portalEnableCompositeFiles: boolean;
  portalMinifyCss: boolean;
  portalMinifyJs: boolean;
  cachingProviderOptions: ISelectOption[];
  pageStatePersistenceOptions: ISelectOption[];
  moduleCacheProviders: ISelectOption[];
  pageCacheProviders: ISelectOption[];
  cacheSettingOptions: ISelectOption[];
  authCacheabilityOptions: ISelectOption[];
  unauthCacheabilityOptions: ISelectOption[];
}

interface IStateProps {
  performanceSettings: IPerformanceSettings;
  loading: boolean;
  isSaving: boolean;
  incrementingVersion: boolean;
  errorMessage: string;
  infoMessage: string;
  isLoading: boolean;
}

interface IDispatchProps {
  onRetrievePerformanceSettings: () => void;
  onChangePerformanceSettingsValue: (key: string, value: any) => void;
  onSave: (settings: IPerformanceSettings) => void;
  onIncrementVersion: (version: number, isGlobalSettings: boolean) => void;
}

type IProps = IStateProps & IDispatchProps;

const Performance: React.FC<IProps> = ({
  performanceSettings,
  isSaving,
  incrementingVersion,
  errorMessage,
  infoMessage,
  isLoading,
  onRetrievePerformanceSettings,
  onChangePerformanceSettingsValue,
  onSave,
  onIncrementVersion,
}) => {
  const prevInfoMessage = useRef(infoMessage);
  const prevErrorMessage = useRef(errorMessage);

  useEffect(() => {
    onRetrievePerformanceSettings();
  }, []);

  useEffect(() => {
    if (prevInfoMessage.current !== infoMessage && infoMessage) {
      utils.notify(infoMessage);
    }
    prevInfoMessage.current = infoMessage;
  }, [infoMessage]);

  useEffect(() => {
    if (prevErrorMessage.current !== errorMessage && errorMessage) {
      utils.notifyError(errorMessage);
    }
    prevErrorMessage.current = errorMessage;
  }, [errorMessage]);

  const handleSave = () => {
    onSave(performanceSettings);
  };

  const confirmHandler = () => {
    const isGlobalSettings =
      performanceSettings.clientResourcesManagementMode === "h";
    if (isGlobalSettings) {
      onIncrementVersion(
        performanceSettings.currentHostVersion,
        isGlobalSettings
      );
    } else {
      onIncrementVersion(
        performanceSettings.currentPortalVersion,
        isGlobalSettings
      );
    }
  };

  const handleIncrementVersion = () => {
    utils.confirm(
      localization.get("PerformanceTab_PortalVersionConfirmMessage"),
      localization.get("PerformanceTab_PortalVersionConfirmYes"),
      localization.get("PerformanceTab_PortalVersionConfirmNo"),
      confirmHandler,
      () => {}
    );
  };

  const onChangeField = (key: string, event: any) => {
    let value = event;
    if (event && event.value !== undefined) {
      value = event.value;
    } else if (event && event.target && event.target.value !== undefined) {
      value = event.target.value;
    }
    onChangePerformanceSettingsValue(key, value);
  };

  if (isLoading) {
    return null;
  }

  const areGlobalSettings =
    performanceSettings.clientResourcesManagementMode === "h";

  let enableCompositeFiles: boolean;
  let minifyCss: boolean;
  let minifyJs: boolean;
  let enableCompositeFilesKey: string;
  let minifyCssKey: string;
  let minifyJsKey: string;
  let version: number;
  let versionLocalizationKey: string;

  if (areGlobalSettings) {
    enableCompositeFiles = performanceSettings.hostEnableCompositeFiles;
    minifyCss = performanceSettings.hostMinifyCss;
    minifyJs = performanceSettings.hostMinifyJs;
    enableCompositeFilesKey = "hostEnableCompositeFiles";
    minifyCssKey = "hostMinifyCss";
    minifyJsKey = "hostMinifyJs";
    version = performanceSettings.currentHostVersion;
    versionLocalizationKey = "PerformanceTab_CurrentHostVersion";
  } else {
    enableCompositeFiles = performanceSettings.portalEnableCompositeFiles;
    minifyCss = performanceSettings.portalMinifyCss;
    minifyJs = performanceSettings.portalMinifyJs;
    enableCompositeFilesKey = "portalEnableCompositeFiles";
    minifyCssKey = "portalMinifyCss";
    minifyJsKey = "portalMinifyJs";
    version = performanceSettings.currentPortalVersion;
    versionLocalizationKey = "PerformanceTab_CurrentPortalVersion";
  }

  return (
    <div className="dnn-servers-info-panel-big performanceSettingTab">
      <WarningBlock
        label={localization.get("PerformanceTab_AjaxWarning")}
      />
      <GridSystem>
        <div className="leftPane">
          <div className="tooltipAdjustment">
            {performanceSettings.pageStatePersistenceOptions && (
              <RadioButtonBlock
                options={performanceSettings.pageStatePersistenceOptions}
                label={localization.get(
                  "PerformanceTab_PageStatePersistenceMode"
                )}
                tooltip={localization.get(
                  "PerformanceTab_PageStatePersistenceMode.Help"
                )}
                onChange={(e: any) => onChangeField("pageStatePersistence", e)}
                value={performanceSettings.pageStatePersistence}
              />
            )}
            {performanceSettings.cacheSettingOptions && (
              <DropdownBlock
                tooltip={localization.get(
                  "PerformanceTab_CachingProvider.Help"
                )}
                label={localization.get("PerformanceTab_CachingProvider")}
                options={performanceSettings.cachingProviderOptions}
                value={performanceSettings.cachingProvider}
                onSelect={(e: any) => onChangeField("cachingProvider", e)}
              />
            )}
            {performanceSettings.moduleCacheProviders && (
              <DropdownBlock
                tooltip={localization.get(
                  "PerformanceTab_ModuleCacheProviders.Help"
                )}
                label={localization.get("PerformanceTab_ModuleCacheProviders")}
                options={performanceSettings.moduleCacheProviders}
                value={performanceSettings.moduleCacheProvider}
                onSelect={(e: any) => onChangeField("moduleCacheProvider", e)}
              />
            )}
            {performanceSettings.pageCacheProviders && (
              <DropdownBlock
                tooltip={localization.get(
                  "PerformanceTab_PageCacheProviders.Help"
                )}
                label={localization.get("PerformanceTab_PageCacheProviders")}
                options={performanceSettings.pageCacheProviders}
                value={performanceSettings.pageCacheProvider}
                onSelect={(e: any) => onChangeField("pageCacheProvider", e)}
              />
            )}
          </div>
        </div>
        <div className="rightPane">
          {performanceSettings.cacheSettingOptions && (
            <DropdownBlock
              tooltip={localization.get("PerformanceTab_CacheSetting.Help")}
              label={localization.get("PerformanceTab_CacheSetting")}
              options={performanceSettings.cacheSettingOptions}
              value={performanceSettings.cacheSetting}
              onSelect={(e: any) => onChangeField("cacheSetting", e)}
            />
          )}
          {performanceSettings.authCacheabilityOptions && (
            <DropdownBlock
              tooltip={localization.get(
                "PerformanceTab_AuthCacheability.Help"
              )}
              label={localization.get("PerformanceTab_AuthCacheability")}
              options={performanceSettings.authCacheabilityOptions}
              value={performanceSettings.authCacheability}
              onSelect={(e: any) => onChangeField("authCacheability", e)}
            />
          )}
          {performanceSettings.unauthCacheabilityOptions && (
            <DropdownBlock
              tooltip={localization.get(
                "PerformanceTab_UnauthCacheability.Help"
              )}
              label={localization.get("PerformanceTab_UnauthCacheability")}
              options={performanceSettings.unauthCacheabilityOptions}
              value={performanceSettings.unauthCacheability}
              onSelect={(e: any) => onChangeField("unauthCacheability", e)}
            />
          )}
          <SwitchBlock
            label={localization.get(
              "PerformanceTab_SslForCacheSyncrhonization"
            )}
            onText={localization.get("SwitchOn")}
            offText={localization.get("SwitchOff")}
            tooltip={localization.get(
              "PerformanceTab_SslForCacheSyncrhonization.Help"
            )}
            value={performanceSettings.sslForCacheSynchronization}
            onChange={(e: any) =>
              onChangeField("sslForCacheSynchronization", e)
            }
          />
        </div>
      </GridSystem>
      <GridCell
        className="dnn-servers-grid-panel newSection"
        style={{ paddingLeft: 0 }}
      >
        <Label
          className="header-title"
          label={localization.get(
            "PerformanceTab_ClientResourceManagementTitle"
          )}
        />
      </GridCell>
      <GridSystem>
        <div className="leftPane">
          <InputGroup>
            <Label
              className="title lowerCase"
              label={localization.get(
                "PerformanceTab_ClientResourceManagementInfo"
              )}
              style={{ width: "auto" }}
            />
          </InputGroup>
          <div className="currentHostVersion">
            <InfoBlock
              label={localization.get(versionLocalizationKey)}
              text={version}
            />
          </div>
          <Button
            type="secondary"
            style={{ marginBottom: "40px" }}
            disable={incrementingVersion}
            onClick={handleIncrementVersion}
          >
            {localization.get("PerformanceTab_IncrementVersion")}
          </Button>
        </div>
        <div className="rightPane"></div>
      </GridSystem>
      <div className="clear" />
      <div className="buttons-panel">
        <Button type="primary" disabled={isSaving} onClick={handleSave}>
          {localization.get("SaveButtonText")}
        </Button>
      </div>
    </div>
  );
};

const mapStateToProps = (state: any): IStateProps => ({
  performanceSettings: state.performanceTab.performanceSettings,
  loading: state.performanceTab.saving,
  isSaving: state.performanceTab.saving,
  incrementingVersion: state.performanceTab.incrementingVersion,
  errorMessage: state.logsTab.errorMessage,
  infoMessage: state.performanceTab.infoMessage,
  isLoading: state.performanceTab.loading,
});

const mapDispatchToProps = (dispatch: any): IDispatchProps => ({
  ...bindActionCreators(
    {
      onRetrievePerformanceSettings:
        PerformanceTabActions.loadPerformanceSettings,
      onChangePerformanceSettingsValue:
        PerformanceTabActions.changePerformanceSettingsValue,
      onSave: PerformanceTabActions.save,
      onIncrementVersion: PerformanceTabActions.incrementVersion,
    },
    dispatch
  ),
});

export default connect(mapStateToProps, mapDispatchToProps)(Performance);
