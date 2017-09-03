<?php
namespace Sitegeist\Excalibur\Command;

/*                                                                        *
 * This script belongs to the Neos Flow package "Sitegeist.Excalibur".    *
 *                                                                        *
 *                                                                        */

use Neos\Flow\Annotations as Flow;
use Neos\Flow\Core\Bootstrap;
use Neos\Flow\Cli\CommandController;
use Neos\Flow\Package\Package;
use Neos\Flow\Package\PackageManagerInterface;
use Neos\Fusion\Core\Parser;
use Neos\Utility\Files;
use Sitegeist\Excalibur\Service\StyleSettingsService;
use Sitegeist\Excalibur\Service\FusionService;
use Sitegeist\Excalibur\Domain\Service\ComponentPathConventionDiscoveryService;

class BuildCommandController extends CommandController
{
    /**
     * @Flow\Inject
     * @var PackageManagerInterface
     */
    protected $packageManager;

    /**
     * @Flow\Inject
     * @var StyleSettingsService
     */
    protected $styleSettingsService;

    /**
     * @Flow\Inject
     * @var FusionService
     */
    protected $fusionService;

	/**
	 * @Flow\Inject
	 * @var ComponentPathConventionDiscoveryService
	 */
	protected $componentPathConventionDiscoveryService;

    /**
     * Collect all possible lookup paths for assets for the given package
     *
     * @param Package $package
     * @return array
     */
	protected function resolveAssetLookupPathsForPackage(Package $package)
	{
		$prototypeNames = $this->fusionService->getAllPrototypeNamesFromPackage($package);
		$result = [];

		foreach ($prototypeNames as $prototypeName) {
			list($packageKey, $componentSubPart) = explode(':', $prototypeName);
			$package = $this->packageManager->getPackage($packageKey);

			$componentPathConvention = $this->componentPathConventionDiscoveryService
				->getComponentPathConventionForPackage($packageKey);

			$result[$prototypeName] = [
				'prototypeName' => $prototypeName,
				'rootPath' => $package->getResourcesPath() . $componentPathConvention->getComponentsDirectoryPath(),
				'componentDirectory' => dirname($componentPathConvention->getPathToFusionFileFromPrototypeName(
					$prototypeName
				)),
				'javascriptLookupPaths' => $componentPathConvention->getJavaScriptLookupPathsFromPrototypeName(
					$prototypeName
				),
				'cssLookupPaths' => $componentPathConvention->getCssLookupPathsFromPrototypeName(
					$prototypeName
				)
			];
		}

		return $result;
	}

    /**
     * This is for build purposes only!
     *
     * @return void
     */
    public function printPackageInformationCommand()
    {
		$info = [];
		foreach ($this->packageManager->getFilteredPackages('active', null, 'neos-site') as $package) {
			$packageKey = $package->getPackageKey();
			$componentPathConvention = $this->componentPathConventionDiscoveryService
				->getComponentPathConventionForPackage($packageKey);

			$info[$packageKey] = [
				'packageKey' => $packageKey,
				'paths' => [
					'package' => $package->getPackagePath(),
					'resources' => $package->getResourcesPath()
				],
				'components' => $this->resolveAssetLookupPathsForPackage($package),
                'styleSettings' => $this->styleSettingsService->getStyleSettingsForPackage($packageKey)
			];
		}

		$this->output(json_encode($info));
    }
}
