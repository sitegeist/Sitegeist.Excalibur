<?php
namespace Sitegeist\Excalibur\Service;

/*                                                                        *
 * This script belongs to the Neos Flow package "Sitegeist.Excalibur".    *
 *                                                                        *
 *                                                                        */

use Neos\Flow\Annotations as Flow;
use Neos\Flow\Package\PackageManagerInterface;
use Neos\Utility\Files;
use Symfony\Component\Yaml\Yaml;

/**
 * @Flow\Scope("singleton")
 */
class StyleSettingsService
{
    /**
     * @Flow\Inject
     * @var PackageManagerInterface
     */
    protected $packageManager;

    public function getStyleSettingsForPackage($packageName)
    {
        $package = $this->packageManager->getPackage($packageName);
        $packagePath = $package->getPackagePath();

        $styleSettingsPath = Files::concatenatePaths([$packagePath, 'excalibur.styles.yaml']);

        if (is_readable($styleSettingsPath)) {
            return Yaml::parse($styleSettingsPath);
        }

        return [];
    }
}
