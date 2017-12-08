<?php
namespace Sitegeist\Excalibur\Aspects;

use Neos\Flow\Annotations as Flow;
use Neos\Flow\Aop\JoinPointInterface;
use Neos\Flow\Reflection\ClassReflection;
use Neos\Flow\Reflection\PropertyReflection;
use Neos\Flow\Package\PackageManagerInterface;
use Neos\Fusion\FusionObjects\AbstractFusionObject;
use Neos\Utility\Files;
use Symfony\Component\Yaml\Yaml;

/**
 * @Flow\Scope("singleton")
 * @Flow\Aspect
 */
class VariableInjectionAspect
{
    /**
     * @Flow\InjectConfiguration(path="features.variableInjection.contextName")
     * @var string
     */
    protected $contextName;

    /**
     * @Flow\Inject
     * @var PackageManagerInterface
     */
    protected $packageManager;

    /**
     * @Flow\Around("setting(Sitegeist.Excalibur.features.variableInjection.enable) && method(PackageFactory\AtomicFusion\FusionObjects\ComponentImplementation->evaluate())")
     * @param JoinPointInterface $joinPoint
     * @return mixed
     */
    public function insertVariablesToComponent(JoinPointInterface $joinPoint)
    {
        $componentImplementation = $joinPoint->getProxy();
        $fusionRuntime = $componentImplementation->getRuntime();
        $packageName = $this->getPackageNameFromFusionObject($componentImplementation);

        $context = $fusionRuntime->getCurrentContext();
        $context[$this->contextName] = $this->getVariablesForPackage($packageName);
        $fusionRuntime->pushContextArray($context);

        $renderedComponent = $joinPoint->getAdviceChain()->proceed($joinPoint);

        $fusionRuntime->popContext();

        return $renderedComponent;
    }

    /**
     * Get the package name for a given fusion object
     *
     * @param AbstractFusionObject $fusionObject
     * @return string
     */
    public function getPackageNameFromFusionObject(AbstractFusionObject $fusionObject)
    {
        $fusionObjectReflection = new ClassReflection($fusionObject);
        $fusionObjectName = $fusionObjectReflection->getProperty('fusionObjectName')->getValue($fusionObject);

        list($packageName) = explode(':', $fusionObjectName);

        return $packageName;
    }

    /**
     * Get configured variables for a given package
     *
     * @param string $packageName
     * @return array
     */
    public function getVariablesForPackage($packageName)
    {
        $package = $this->packageManager->getPackage($packageName);
        $packagePath = $package->getPackagePath();
        $styleSettingsPath = Files::concatenatePaths([$packagePath, 'excalibur.variables.yaml']);

        if (is_readable($styleSettingsPath)) {
            return Yaml::parse($styleSettingsPath);
        }

        return [];
    }
}
