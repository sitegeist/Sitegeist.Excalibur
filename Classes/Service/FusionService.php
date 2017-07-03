<?php
namespace Sitegeist\Excalibur\Service;

/*                                                                        *
 * This script belongs to the Neos Flow package "Sitegeist.Excalibur".    *
 *                                                                        *
 *                                                                        */

use Neos\Flow\Annotations as Flow;
use Neos\Flow\Package\Package;
use Neos\Fusion\Core\Runtime as FusionRuntime;
use Neos\Fusion\Core\Parser as FusionParser;
use PackageFactory\AtomicFusion\FusionObjects\ComponentImplementation;
use Neos\Utility\Files;

/**
 * @Flow\Scope("singleton")
 */
class FusionService
{
	/**
	 * @Flow\Inject
	 * @var FusionParser
	 */
	protected $fusionParser;

    /**
     * Removes one level from a fusion path
     *
     * @param string $fusionPath
     * @return string
     */
    public function removeLevelFromFusionPath($fusionPath)
    {
        $fusionPath = explode('/', $fusionPath);
        array_pop($fusionPath);
        $fusionPath = implode('/', $fusionPath);

        return $fusionPath;
    }

    /**
     * Extract the class name from the given fusion path
     *
     * @param string $fusionPath
     * @param FusionRuntime $fusionRuntime
     * @return string
     */
    public function extractClassNameFromFusionPath($fusionPath, FusionRuntime $fusionRuntime)
    {
        $classPath = sprintf('%s/__meta/class', $fusionPath);

        if ($fusionRuntime->canRender($classPath)) {
            return $fusionRuntime->render($classPath);
        }
    }

    /**
     * Extract the prototype name from the given fusion path
     *
     * @param string $fusionPath
     * @return string
     */
    public function extractPrototypeNameFromFusionPath($fusionPath)
    {
        $fusionPath = explode('<', $fusionPath);
        $prototypeName = array_pop($fusionPath);

        return rtrim($prototypeName, '>');
    }

    /**
     * Make sure, that the given fusion path is inside an AtomicFusion component
     *
     * @param $fusionPath
     * @return string
     * @throws FusionException
     */
    public function ensureComponentFromPath($fusionPath, FusionRuntime $fusionRuntime)
    {
        while (strpos($fusionPath, '/') !== false) {
            $fusionPath = $this->removeLevelFromFusionPath($fusionPath);
            $className = $this->extractClassNameFromFusionPath($fusionPath, $fusionRuntime);

            if ($className === ComponentImplementation::class || is_a($className, ComponentImplementation::class)) {
                return $fusionPath;
            }
        }

        throw new FusionException('Requested Path is not inside a component', 1499003384);
    }

    /**
     * Infer the home package name of the currently rendered component
     *
     * @param string $fusionPath
     * @return string
     * @throws FusionException
     */
    public function inferPackageNameFromPath($fusionPath, FusionRuntime $fusionRuntime)
    {
        $fusionPath = $this->ensureComponentFromPath($fusionPath, $fusionRuntime);
        $prototypeName = $this->extractPrototypeNameFromFusionPath($fusionPath);

        list($packageName) = explode(':', $prototypeName);

        return $packageName;
    }

	/**
	 * Get all available fusion prototype names for a given flow package
	 *
	 * @param Package $package
	 * @return array
	 */
	public function getAllPrototypeNamesFromPackage(Package $package)
	{
		$rootPath = Files::concatenatePaths([$package->getResourcesPath(), 'Private/Fusion/Root.fusion']);
		$fusionCode = Files::getFileContents($rootPath);
		$fusionAst = $this->fusionParser->parse($fusionCode, $rootPath);

		if (!array_key_exists('__prototypes', $fusionAst)) {
			return [];
		}

		$prototypeNames = array_keys($fusionAst['__prototypes']);

		return $prototypeNames;
	}
}
