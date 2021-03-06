<?php
namespace Sitegeist\Excalibur\Domain\Service;

/*
 * This file is part of the Sitegeist.Excalibur package.
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

interface ComponentPathConventionInterface
{
	/**
	 * Get the path to the directory in which to find the fusion files for
	 * all components.
	 *
	 * @return string
	 */
	public function getComponentsDirectoryPath();

	/**
	 * Get the path to the component fusion file from its prototype name
	 *
	 * @param string $prototypeName
	 * @return string
	 */
	public function getPathToFusionFileFromPrototypeName($prototypeName);

	/**
	 * Get the corresponding prototype name for a fusion file.
	 *
	 * @param string $packageKey
	 * @param string $pathToFusionFile
	 * @return string
	 */
	public function getPrototypeNameFromPathToFusionFile($packageKey, $pathToFusionFile);

	/**
	 * Get the lookup path for component-related javascript files
	 *
	 * @param string $prototypeName
	 * @return array
	 */
	public function getJavaScriptLookupPathsFromPrototypeName($prototypeName);

	/**
	 * Get the lookup path for component-related css files
	 *
	 * @param string $prototypeName
	 * @return array
	 */
	public function getCssLookupPathsFromPrototypeName($prototypeName);

	/**
	 * Get any additional javascript files that should be loaded
	 *
	 * @return array
	 */
	public function getAdditionalJavaScriptFiles();

	/**
	 * Get any additional css files that should be loaded
	 *
	 * @return array
	 */
	public function getAdditionalCssFiles();
}
