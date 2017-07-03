<?php
namespace Sitegeist\Excalibur\Domain\Service;

/*
 * This file is part of the Sitegeist.Excalibur package.
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

class DefaultComponentPathConvention implements ComponentPathConventionInterface
{
	/**
	 * Get the path to the directory in which to find the fusion files for
	 * all components.
	 *
	 * @return string
	 */
	public function getComponentsDirectoryPath()
	{
		return 'Private/Fusion/Component/';
	}

	/**
	 * Get the path to the component fusion file from its prototype name
	 *
	 * @param string $prototypeName
	 * @return string
	 */
	public function getPathToFusionFileFromPrototypeName($prototypeName)
	{
		list(,$componentSubPart) = explode(':', $prototypeName);

		$pathToComponent = explode('.', $componentSubPart);

		if ($pathToComponent[0] === 'Component') {
			array_shift($pathToComponent);
		}
		$pathToComponent = implode('/', $pathToComponent);

		return sprintf('%s/index.fusion', $pathToComponent);
	}

	/**
	 * Get the corresponding prototype name for a fusion file.
	 *
	 * @param string $packageKey
	 * @param string $pathToFusionFile
	 * @return string
	 */
	public function getPrototypeNameFromPathToFusionFile($packageKey, $pathToFusionFile)
	{
		$componentSubPart = explode('/', $componentSubPart);
		array_pop($componentSubPart);
		$componentSubPart = implode('.', $componentSubPart);

		return sprintf('%s:%s', $packageKey, $componentSubPart);
	}

	/**
	 * Get the lookup path for component-related javascript files
	 *
	 * @param string $prototypeName
	 * @return array
	 */
	public function getJavaScriptLookupPathsFromPrototypeName($prototypeName)
	{
		$pathToFusionFile = $this->getPathToFusionFileFromPrototypeName($prototypeName);
		$componentDirectory = dirname($pathToFusionFile);

		$componentIdentifier = explode('/', $componentDirectory);
		$componentIdentifier = array_pop($componentIdentifier);

		return [
			sprintf('%s/index.js', $componentDirectory),
			sprintf('%s/Index.js', $componentDirectory),
			sprintf('%s/component.js', $componentDirectory),
			sprintf('%s/Component.js', $componentDirectory),
			sprintf('%s/%s.js', $componentDirectory, lcfirst($componentIdentifier)),
			sprintf('%s/%s.js', $componentDirectory, $componentIdentifier)
		];
	}

	/**
	 * Get the lookup path for component-related css files
	 *
	 * @param string $prototypeName
	 * @return array
	 */
	public function getCssLookupPathsFromPrototypeName($prototypeName)
	{
		$pathToFusionFile = $this->getPathToFusionFileFromPrototypeName($prototypeName);
		$componentDirectory = dirname($pathToFusionFile);

		$componentIdentifier = explode('/', $componentDirectory);
		$componentIdentifier = array_pop($componentIdentifier);

		return [
			sprintf('%s/index.css', $componentDirectory),
			sprintf('%s/Index.css', $componentDirectory),
			sprintf('%s/component.css', $componentDirectory),
			sprintf('%s/Component.css', $componentDirectory),
			sprintf('%s/%s.css', $componentDirectory, lcfirst($componentIdentifier)),
			sprintf('%s/%s.css', $componentDirectory, $componentIdentifier)
		];
	}

	/**
	 * Get any additional javascript files that should be loaded
	 *
	 * @return array
	 */
	public function getAdditionalJavaScriptFiles()
	{
		return [];
	}

	/**
	 * Get any additional css files that should be loaded
	 *
	 * @return array
	 */
	public function getAdditionalCssFiles()
	{
		return [];
	}
}
