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
		array_shift($pathToComponent);
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
	 * @return sring
	 */
	public function getJavaScriptLookupPathFromPrototypeName($prototypeName)
	{
		$pathToFusionFile = $this->getPathToFusionFileFromPrototypeName($prototypeName);

		return sprintf('%sindex.js', dirname($pathToFusionFile));
	}

	/**
	 * Get the lookup path for component-related css files
	 *
	 * @param string $prototypeName
	 * @return sring
	 */
	public function getCssLookupPathFromPrototypeName($prototypeName)
	{
		$pathToFusionFile = $this->getPathToFusionFileFromPrototypeName($prototypeName);

		return sprintf('%sindex.css', dirname($pathToFusionFile));
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
