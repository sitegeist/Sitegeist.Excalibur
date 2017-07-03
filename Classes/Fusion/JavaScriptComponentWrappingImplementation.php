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
use Neos\Flow\Security\Authorization\PrivilegeManagerInterface;
use Neos\Neos\Domain\Service\ContentContext;
use Neos\Neos\Service\HtmlAugmenter;
use Neos\ContentRepository\Domain\Model\NodeInterface;
use Neos\Fusion\FusionObjects\AbstractFusionObject;

class JavaScriptComponentWrappingImplementation extends AbstractFusionObject
{
    /**
     * @Flow\Inject
     * @var HtmlAugmenter
     */
    protected $htmlAugmenter;

    /**
     * The string to be processed
     *
     * @return string
     */
    public function getValue()
    {
        return $this->fusionValue('value');
    }

    /**
     * The component props
     *
     * @return array
     */
    public function getProps()
    {
        return $this->fusionValue('props');
    }

    /**
     * Evaluate this Fusion object and return the result
     *
     * @return mixed
     */
    public function evaluate()
    {
        return $this->htmlAugmenter->addAttributes(
            $this->getValue(),
            [
                'data-component' => $this->generateComponentName(),
                'data-props' => json_encode($this->getProps())
            ]
        );
    }

    protected function generateComponentName()
    {
        $expectedStructure = [
            'process',
            '__meta',
            'renderer'
        ];
        $pathParts = array_reverse(explode('/', $this->path));

        foreach ($pathParts as $key => $value) {
            if ($key < 1) continue;
            if ($key > 3) {
                $componentPathSegment = $value;
                break;
            }
            if ($expectedStructure[$key - 1] !== $value)
                throw new Exception('You are supposed to use this wrapping as a processor on a renderer');
        }

        $prototypeName = explode('<', $componentPathSegment);
        $prototypeName = substr($prototypeName[1], 0, -1);

        return $prototypeName;
    }
}
