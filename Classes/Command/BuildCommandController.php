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
     * This is for build purposes only!
     *
     * @param string $sitePackageKey
     * @return void
     */
    public function printLookupPathsForSitePackageCommand($sitePackageKey)
    {
        $rootPath = sprintf('resource://%s/Private/Fusion/Root.fusion', $sitePackageKey);
        $fusionCode = Files::getFileContents($rootPath);
        $fusionAst = $this->fusionParser->parse($fusionCode, $rootPath);

        $prototypes = array_keys($fusionAst['__prototypes']);

        $self = $this;
        $lookupPaths = array_map(function ($prototypeName) use ($self) {
            list($packageKey, $componentName) = explode(':', $prototypeName);

            return sprintf(
                '%s/Resources/Private/Fusion/%s',
                $self->packageManager->getPackage($packageKey)->getPackagePath(),
                implode('/', explode('.', $componentName))
            );
        }, $prototypes);

        $this->outputLine(
            json_encode(
                $lookupPaths
            )
        );
    }
}
