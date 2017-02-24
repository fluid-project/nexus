/*
Copyright 2016, 2017 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://raw.githubusercontent.com/GPII/nexus/master/LICENSE.txt
*/

/* eslint-env node */

"use strict";

var fluid = require("infusion"),
    gpii = fluid.registerNamespace("gpii");

fluid.defaults("gpii.nexus.recipe", {
    gradeNames: "fluid.modelComponent"
});

fluid.defaults("gpii.nexus.recipeProduct", {
    gradeNames: "fluid.modelComponent"
});

fluid.defaults("gpii.nexus.recipeMatcher", {
    gradeNames: "fluid.component",
    invokers: {
        matchRecipe: {
            funcName: "gpii.nexus.recipeMatcher.matchRecipe",
            args: [
                "{arguments}.0", // recipe to test
                "{arguments}.1"  // array of components
            ]
        }
    }
});

gpii.nexus.recipeMatcher.matchRecipe = function (recipe, components) {
    var matchedReactants = {};
    var foundAllReactants = true;
    fluid.each(recipe.reactants, function (reactant, reactantName) {
        var foundReactant = fluid.find(components, function (component) {
            if (gpii.nexus.recipeMatcher.componentMatchesReactantSpec(component, reactant.match)) {
                matchedReactants[reactantName] = component;
                return true;
            }
        });
        if (!foundReactant) {
            foundAllReactants = false;
        }
    });
    if (foundAllReactants) {
        return matchedReactants;
    } else {
        return false;
    }
};

// TODO: Copy the source for fluid.matchIoCSelector() and extend with
// other predicate types. To start, use the parsed version of the IoCSS
// expressions directly in the recipes (rather than implementing parsing
// logic for CSS-like syntax). In the future we could adopt a CSS-like
// syntax for the new predicate types.
//
// fluid.matchIoCSelector():
//
// https://github.com/fluid-project/infusion/blob/master/src/framework/core/js/FluidIoC.js#L322

gpii.nexus.recipeMatcher.componentMatchesReactantSpec = function (component, matchRules) {
    if (matchRules.type === "gradeMatcher") {
        return fluid.componentHasGrade(component, matchRules.gradeName);
    }
};

// TODO: Who names recipe products?
//       - Configured in each recipe; or
//       - Randomly assigned by the Co-Occurrence Engine

fluid.defaults("gpii.nexus.coOccurrenceEngine", {
    gradeNames: "fluid.modelComponent",
    members: {
        // TODO: Is "members" the best place for this map?

        // When a reactant is destroyed, we destroy any products that
        // the reactant is a member of. The "reactantRecipeMembership"
        // object is used to maintain a map from reactant component id
        // to product path and is consulted at reactant destruction.
        reactantRecipeMembership: {}
    },
    components: {
        nexusComponentRoot: {
            type: "gpii.nexus.nexusComponentRoot"
        },
        recipeMatcher: {
            type: "gpii.nexus.recipeMatcher"
        }
    },
    model: {
        recipes: {}
    },
    events: {
        onProductCreated: null
    },
    listeners: {
        "{nexusComponentRoot}.events.onComponentCreated": {
            funcName: "gpii.nexus.coOccurrenceEngine.componentCreated",
            args: [
                "{that}.nexusComponentRoot",
                "{that}.recipeMatcher",
                "{that}.model.recipes",
                "{that}.reactantRecipeMembership",
                "{that}.events.onProductCreated"
            ]
        },
        "{nexusComponentRoot}.events.onComponentDestroyed": {
            funcName: "gpii.nexus.coOccurrenceEngine.componentDestroyed",
            args: [
                "{that}.nexusComponentRoot",
                "{that}.reactantRecipeMembership",
                "{arguments}.0.id" // Id of component destroyed
            ]
        }
    }
});

gpii.nexus.coOccurrenceEngine.componentCreated = function (componentRoot, recipeMatcher, recipes, reactantRecipeMembership, productCreatedEvent) {
    var components = [];

    // TODO: This will only collect direct children of componentRoot, we
    // want all descendants
    // TODO: Maybe better to pass the componentRoot directly to the
    // recipeMatcher and let it do the walking
    fluid.each(componentRoot, function (component) {
        if (fluid.isComponent(component)) {
            components.push(component);
        }
    });

    if (components.length > 0) {
        fluid.each(recipes, function (recipe) {
            // Process the recipe if we don't already have a product
            // constructed for it
            var productPath = recipe.product.path;
            if (!componentRoot.containsComponent(productPath)) {
                var matchedReactants = recipeMatcher.matchRecipe(recipe, components);
                if (matchedReactants) {
                    // Extend the product options with the reactant
                    // component paths and an event listener for onCreated
                    var productOptions = fluid.extend({
                        componentPaths: { },
                        listeners: {
                            "onCreate.fireCoOccurrenceEngineProductCreated": {
                                "this": productCreatedEvent,
                                method: "fire"
                            }
                        }
                    }, recipe.product.options);
                    fluid.each(matchedReactants, function (reactantComponent, reactantName) {
                        productOptions.componentPaths[reactantName] = fluid.pathForComponent(reactantComponent);
                    });

                    // Record matchedReactants product membership
                    fluid.each(matchedReactants, function (reactantComponent) {
                        var reactantId = reactantComponent.id;
                        if (fluid.contains(reactantRecipeMembership, reactantId)) {
                            reactantRecipeMembership[reactantId].push(productPath);
                        } else {
                            reactantRecipeMembership[reactantId] = [ productPath ];
                        }
                    });

                    // Construct Product
                    componentRoot.constructComponent(productPath, productOptions);
                }
            }
        });
    }
};

gpii.nexus.coOccurrenceEngine.componentDestroyed = function (componentRoot, reactantRecipeMembership, destroyedComponentId) {
    var parentPaths = reactantRecipeMembership[destroyedComponentId];
    fluid.each(parentPaths, function (parentPath) {
        componentRoot.destroyComponent(parentPath);
    });
};
