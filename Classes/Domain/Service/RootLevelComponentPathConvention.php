<?php
namespace Sitegeist\Excalibur\Domain\Service;

/*
 * This file is part of the Sitegeist.Excalibur package.
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

class RootLevelComponentPathConvention extends DefaultComponentPathConvention
{
	/**
	 * Get the path to the directory in which to find the fusion files for
	 * all components.
	 *
	 * @return string
	 */
	public function getComponentsDirectoryPath()
	{
		return 'Private/Fusion/';
	}
}
