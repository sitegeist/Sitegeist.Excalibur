<?php
namespace Sitegeist\Excalibur;

/*
 * This file is part of the Neos.Fusion package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use Neos\Flow\Cache\CacheManager;
use Neos\Flow\Core\Booting\Sequence;
use Neos\Flow\Core\Bootstrap;
use Neos\Flow\Monitor\FileMonitor;
use Neos\Flow\Package\Package as BasePackage;
use Neos\Flow\Package\PackageManagerInterface;
use Neos\Fusion\Core\Cache\FileMonitorListener;

/**
 * The Neos Fusion Package
 */
class Package extends BasePackage
{
    /**
     * Invokes custom PHP code directly after the package manager has been initialized.
     *
     * @param Bootstrap $bootstrap The current bootstrap
     * @return void
     */
    public function boot(Bootstrap $bootstrap)
    {
        $dispatcher = $bootstrap->getSignalSlotDispatcher();
        $context = $bootstrap->getContext();

        if (!$context->isProduction()) {
            $dispatcher->connect(Sequence::class, 'afterInvokeStep', function ($step) use ($bootstrap, $dispatcher) {
                if ($step->getIdentifier() === 'neos.flow:systemfilemonitor') {
                    $fusionFileMonitor = FileMonitor::createFileMonitorAtBoot('JavaScript_Files', $bootstrap);
                    $packageManager = $bootstrap->getEarlyInstance(PackageManagerInterface::class);
                    foreach ($packageManager->getActivePackages() as $packageKey => $package) {
                        if ($packageManager->isPackageFrozen($packageKey)) {
                            continue;
                        }

                        $fusionPaths = array(
                            $package->getResourcesPath() . 'Private/Fusion'
                        );
                        foreach ($fusionPaths as $fusionPath) {
                            if (is_dir($fusionPath)) {
                                $fusionFileMonitor->monitorDirectory($fusionPath, '\.(css\|js)$');
                            }
                        }
                    }

                    $fusionFileMonitor->detectChanges();
                    $fusionFileMonitor->shutdownObject();
                }

                if ($step->getIdentifier() === 'neos.flow:cachemanagement') {
                    $dispatcher->connect(FileMonitor::class, 'filesHaveChanged', $this, 'buildFrontend');
                }
            });
        }
    }

    public function buildFrontend()
    {
        if (php_sapi_name() !== 'cli') {
            exec('yarn build:js');
        }
    }
}
