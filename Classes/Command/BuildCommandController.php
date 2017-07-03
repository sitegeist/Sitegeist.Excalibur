<?php
namespace Sitegeist\Excalibur\Command;

/*                                                                        *
 * This script belongs to the Neos Flow package "Sitegeist.Excalibur".    *
 *                                                                        *
 *                                                                        */

use Neos\Flow\Annotations as Flow;
use Neos\Flow\Core\Bootstrap;
use Neos\Flow\Cli\CommandController;
use Neos\Flow\Package\PackageManagerInterface;
use Neos\Fusion\Core\Parser;
use Neos\Utility\Files;
use Sitegeist\Excalibur\Service\StyleSettingsService;
use Sitegeist\Excalibur\Domain\Service\ComponentPathConventionDiscoveryService;

class BuildCommandController extends CommandController
{
    /**
     * @Flow\Inject
     * @var Parser
     */
    protected $fusionParser;

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
	 * @var ComponentPathConventionDiscoveryService
	 */
	protected $componentPathConventionDiscoveryService;

    /**
     * This is for build purposes only!
     *
     * @param string $sitePackageKey
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
					'resources' => $package->getResourcesPath(),
					'components' => $package->getResourcesPath() . $componentPathConvention->getComponentsDirectoryPath()
				]
			];
		}

		$this->output(json_encode($info));
        // $rootPath = sprintf('resource://%s/Private/Fusion/Root.fusion', $sitePackageKey);
        // $fusionCode = Files::getFileContents($rootPath);
        // $fusionAst = $this->fusionParser->parse($fusionCode, $rootPath);
		//
        // if (!array_key_exists('__prototypes', $fusionAst)) {
        //     $this->outputLine('[]');
        //     $this->quit(0);
        // }
		//
        // $prototypes = array_keys($fusionAst['__prototypes']);
		//
        // $self = $this;
        // $lookupPaths = array_map(function ($prototypeName) use ($self) {
        //     list($packageKey, $componentName) = explode(':', $prototypeName);
		//
        //     return sprintf(
        //         '%s/Resources/Private/Fusion/%s',
        //         $self->packageManager->getPackage($packageKey)->getPackagePath(),
        //         implode('/', explode('.', $componentName))
        //     );
        // }, $prototypes);
		//
        // $this->outputLine(
        //     json_encode(
        //         $lookupPaths
        //     )
        // );
    }

    /**
     * This is for build purposes only!
     *
     * @param string $sitePackageKey
     * @return void
     */
    public function printStyleSettingsForSitePackageCommand($sitePackageKey)
    {
        $styleSettings = $this->styleSettingsService->getStyleSettingsForPackage($sitePackageKey);

        $this->outputLine(
            json_encode(
                $styleSettings
            )
        );
    }
}
