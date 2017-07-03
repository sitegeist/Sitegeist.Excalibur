<?php
namespace Sitegeist\Excalibur\Domain\Service;

/*
 * This file is part of the Sitegeist.Excalibur package.
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use Neos\Flow\Annotations as Flow;
use Neos\Flow\ObjectManagement\ObjectManagerInterface;

/**
 * @Flow\Scope("singleton")
 */
class ComponentPathConventionDiscoveryService
{
	/**
	 * @Flow\InjectConfiguration("componentPathConvention.default")
	 * @var string
	 */
	protected $defaultComponentPathConvention;

	/**
	 * @Flow\InjectConfiguration("componentPathConvention.perPackage")
	 * @var array
	 */
	protected $mapping;

	/**
	 * @var array
	 */
	protected $runtimeCache = [];

	/**
	 * @Flow\Inject
	 * @var ObjectManagerInterface
	 */
	protected $objectManager;

	public function getComponentPathConventionForPackage($packageKey)
	{
		if (array_key_exists($packageKey, $this->runtimeCache)) {
			return $this->runtimeCache[$packageKey];
		}

		$className = array_key_exists($packageKey, $this->mapping) ?
			$this->mapping[$packageKey] : $this->defaultComponentPathConvention;

		return $this->runtimeCache[$packageKey] = $this->objectManager->get($className);
	}
}
