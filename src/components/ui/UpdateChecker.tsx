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
  const [error, setError] = useState<string | null>(null);

  const upToDateTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
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
      setError(null);
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
      setError('Failed to check for updates');
      if (upToDateTimeoutRef.current) {
        clearTimeout(upToDateTimeoutRef.current);
      }
      upToDateTimeoutRef.current = setTimeout(() => {
        setError(null);
      }, 5000);
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
      setError(null);
      downloadedBytesRef.current = 0;
      contentLengthRef.current = 0;
      const update = await check();

      if (!update) {
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

      // Update installed successfully, now try to restart
      console.log('Update installed successfully, attempting to restart...');

      try {
        await relaunch();
      } catch (relaunchError) {
        // If auto-restart fails, show message to user
        console.error('Auto-restart failed:', relaunchError);
        setError('Update installed! Please restart the app to complete.');
        setTimeout(() => {
          setError(null);
        }, 15000); // Show for 15 seconds
      }
    } catch (error) {
      console.error('Failed to install update:', error);
      // Show more detailed error message to help users troubleshoot
      const errorMessage = error instanceof Error ? error.message : 'Failed to install update';
      setError(`Update failed: ${errorMessage}`);
      setTimeout(() => {
        setError(null);
      }, 8000);  // Increased timeout so users can read the error
    } finally {
      setIsInstalling(false);
      setDownloadProgress(0);
      downloadedBytesRef.current = 0;
      contentLengthRef.current = 0;
    }
  };

  const getUpdateStatusText = () => {
    if (error) return error;
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
    !isUpdateDisabled && (updateAvailable || (!isChecking && !showUpToDate && !error));

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
        <span className={`text-xs ${error ? 'text-red-400' : 'text-tertiary'}`}>
          {getUpdateStatusText()}
        </span>
      )}
    </div>
  );
}
