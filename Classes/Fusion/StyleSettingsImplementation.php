<?php
namespace Sitegeist\Excalibur\Fusion;

/*
 * This file is part of the Sitegeist.Excalibur package.
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use Neos\Flow\Annotations as Flow;
use Neos\Fusion\FusionObjects\AbstractFusionObject;
use Neos\Utility\ObjectAccess;
use Sitegeist\Excalibur\Service\StyleSettingsService;
use Sitegeist\Excalibur\Service\FusionService;

class StyleSettingsImplementation extends AbstractFusionObject
{
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
     * Evaluate this Fusion object and return the result
     *
     * @return mixed
     */
    public function evaluate()
    {
        $path = $this->tsValue('path');
        $packageName = $this->tsValue('packageName') ?:
            $this->fusionService->inferPackageNameFromPath($this->path, $this->runtime);

        $styleSettings = $this->styleSettingsService->getStyleSettingsForPackage($packageName);

        return ObjectAccess::getPropertyPath($styleSettings, $path);
    }
}
