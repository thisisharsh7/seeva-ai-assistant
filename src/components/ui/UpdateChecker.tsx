import { useState, useEffect, useRef } from 'react';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { Spinner } from './Spinner';

interface UpdateCheckerProps {
  className?: string;
}

export function UpdateChecker({ className = '' }: UpdateCheckerProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showUpToDate, setShowUpToDate] = useState(false);

  const upToDateTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const isManualCheckRef = useRef(false);
  const downloadedBytesRef = useRef(0);
  const contentLengthRef = useRef(0);

  useEffect(() => {
    checkForUpdates();

    return () => {
      if (upToDateTimeoutRef.current) {
        clearTimeout(upToDateTimeoutRef.current);
      }
    };
  }, []);

  const checkForUpdates = async () => {
    if (isChecking) return;

    try {
      setIsChecking(true);
      const update = await check();

      if (update) {
        setUpdateAvailable(true);
        setShowUpToDate(false);
      } else {
        setUpdateAvailable(false);

        if (isManualCheckRef.current) {
          setShowUpToDate(true);
          if (upToDateTimeoutRef.current) {
            clearTimeout(upToDateTimeoutRef.current);
          }
          upToDateTimeoutRef.current = setTimeout(() => {
            setShowUpToDate(false);
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    } finally {
      setIsChecking(false);
      isManualCheckRef.current = false;
    }
  };

  const handleManualUpdateCheck = () => {
    isManualCheckRef.current = true;
    checkForUpdates();
  };

  const installUpdate = async () => {
    try {
      setIsInstalling(true);
      setDownloadProgress(0);
      downloadedBytesRef.current = 0;
      contentLengthRef.current = 0;
      const update = await check();

      if (!update) {
        console.log('No update available during install attempt');
        return;
      }

      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case 'Started':
            downloadedBytesRef.current = 0;
            contentLengthRef.current = event.data.contentLength ?? 0;
            break;
          case 'Progress':
            downloadedBytesRef.current += event.data.chunkLength;
            const progress =
              contentLengthRef.current > 0
                ? Math.round(
                    (downloadedBytesRef.current / contentLengthRef.current) * 100
                  )
                : 0;
            setDownloadProgress(Math.min(progress, 100));
            break;
        }
      });
      await relaunch();
    } catch (error) {
      console.error('Failed to install update:', error);
    } finally {
      setIsInstalling(false);
      setDownloadProgress(0);
      downloadedBytesRef.current = 0;
      contentLengthRef.current = 0;
    }
  };

  const getUpdateStatusText = () => {
    if (isInstalling) {
      return downloadProgress > 0 && downloadProgress < 100
        ? `Downloading ${downloadProgress}%`
        : downloadProgress === 100
          ? 'Installing...'
          : 'Preparing...';
    }
    if (isChecking) return 'Checking...';
    if (showUpToDate) return 'Up to date';
    if (updateAvailable) return 'Update available';
    return 'Check for updates';
  };

  const getUpdateStatusAction = () => {
    if (updateAvailable && !isInstalling) return installUpdate;
    if (!isChecking && !isInstalling && !updateAvailable)
      return handleManualUpdateCheck;
    return undefined;
  };

  const isUpdateDisabled = isChecking || isInstalling;
  const isUpdateClickable =
    !isUpdateDisabled && (updateAvailable || (!isChecking && !showUpToDate));

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {(isChecking || isInstalling) && (
        <Spinner size="sm" className="text-accent-blue" />
      )}

      {isUpdateClickable ? (
        <button
          onClick={getUpdateStatusAction()}
          disabled={isUpdateDisabled}
          className={`text-xs transition-colors disabled:opacity-50 ${
            updateAvailable
              ? 'text-accent-blue hover:text-accent-blue/80 font-medium'
              : 'text-tertiary hover:text-secondary'
          }`}
        >
          {getUpdateStatusText()}
        </button>
      ) : (
        <span className="text-xs text-tertiary">
          {getUpdateStatusText()}
        </span>
      )}
    </div>
  );
}
