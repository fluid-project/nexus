/*
Copyright 2015, 2016, 2017 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://raw.githubusercontent.com/fluid-project/infusion-nexus/master/LICENSE.txt
*/

/* eslint-env node */

"use strict";

var fluid = require("infusion"),
    jqUnit = fluid.require("node-jqunit");

fluid.registerNamespace("fluid.test.nexus");

fluid.test.nexus.assertStatusCode = function (request, statusCode) {
    var response = request.nativeResponse;
    jqUnit.assertEquals("Response has status code " + statusCode, statusCode, response.statusCode);
};

fluid.test.nexus.verifyReadDefaultsResponse = function (body, request, expectedGradeSpec) {
    // TODO: Switch over to the new assertion function of KETTLE-39
    var responseGradeSpec = JSON.parse(body);
    var response = request.nativeResponse;
    jqUnit.assertEquals("Response has status code 200", 200, response.statusCode);
    jqUnit.assertTrue("Response has JSON content-type",
                      response.headers["content-type"].indexOf("application/json") === 0);
    jqUnit.assertLeftHand("Response has expected grade specification", expectedGradeSpec, responseGradeSpec);
};


/**
 * Verify that a response to the component reading endpoint is well-formed and has the expected content.
 * @param {String} body the body of the HTTP response.
 * @param {kettle.request.http} request the component representing the HTTP response.
 * @param {Object} expectedComponentMaterial the expected content of the response body.
 */
fluid.test.nexus.verifyReadComponentResponse = function (body, request, expectedComponentMaterial) {
    var responseComponentMaterial = JSON.parse(body);
    var response = request.nativeResponse;
    jqUnit.assertEquals("Response has status code 200", 200, response.statusCode);
    jqUnit.assertTrue("Response has JSON content-type",
                      response.headers["content-type"].indexOf("application/json") === 0);
    jqUnit.assertLeftHand("Response has expected component material", expectedComponentMaterial,
    responseComponentMaterial);
};

fluid.test.nexus.assertNoComponentAtPath = function (message, componentRoot, path) {
    jqUnit.assertFalse(message, fluid.nexus.containsComponent(componentRoot, path));
};

fluid.test.nexus.assertComponentModel = function (message, componentRoot, path, expectedModel) {
    var component = fluid.nexus.componentForPathInContainer(componentRoot, path);
    jqUnit.assertValue("Component exists", component);
    jqUnit.assertDeepEq(message, expectedModel, component.model);
};

fluid.test.nexus.assertNotContainsComponent = function (componentRoot, parentPath, childName) {
    var parent = fluid.nexus.componentForPathInContainer(componentRoot, parentPath);
    jqUnit.assertNoValue(parentPath + " component does not contain " + childName, parent[childName]);
};

fluid.test.nexus.assertContainsComponent = function (componentRoot, parentPath, childName) {
    var parent = fluid.nexus.componentForPathInContainer(componentRoot, parentPath);
    jqUnit.assertValue(parentPath + " component contains " + childName, parent[childName]);
};

// all test request grades communicate with a port defined by the test configuration,
// and a path parameterized by either a gradeName or componentPath set in a termMap.
fluid.defaults("fluid.test.nexus.request.http", {
    gradeNames: ["kettle.test.request.http"],
    port: "{configuration}.options.serverPort",
    termMap: {
        gradeName: "fill in construction options",
        componentPath: "fill in construction options"
    }
});

fluid.defaults("fluid.test.nexus.readDefaultsRequest", {
    gradeNames: ["fluid.test.nexus.request.http"],
    path: "/defaults/%gradeName",
    method: "GET"
});

fluid.defaults("fluid.test.nexus.writeDefaultsRequest", {
    gradeNames: ["fluid.test.nexus.request.http"],
    path: "/defaults/%gradeName",
    method: "PUT"
});

fluid.defaults("fluid.test.nexus.readComponentRequest", {
    gradeNames: ["fluid.test.nexus.request.http"],
    path: "/components/%componentPath",
    method: "GET"
});

fluid.defaults("fluid.test.nexus.constructComponentRequest", {
    gradeNames: ["fluid.test.nexus.request.http"],
    path: "/components/%componentPath",
    method: "PUT"
});

fluid.defaults("fluid.test.nexus.destroyComponentRequest", {
    gradeNames: ["fluid.test.nexus.request.http"],
    path: "/components/%componentPath",
    method: "DELETE"
});

fluid.defaults("fluid.test.nexus.testCaseHolder", {
    gradeNames: "kettle.test.testCaseHolder",
    components: {
        readDefaultsRequest1: {
            type: "fluid.test.nexus.readDefaultsRequest",
            options: {
                termMap: {
                    gradeName: "{tests}.options.testGradeName"
                }
            }
        },
        readDefaultsRequest2: {
            type: "fluid.test.nexus.readDefaultsRequest",
            options: {
                termMap: {
                    gradeName: "{tests}.options.testGradeName"
                }
            }
        },
        readDefaultsRequest3: {
            type: "fluid.test.nexus.readDefaultsRequest",
            options: {
                termMap: {
                    gradeName: "{tests}.options.testGradeName"
                }
            }
        },
        writeDefaultsRequest1: {
            type: "fluid.test.nexus.writeDefaultsRequest",
            options: {
                termMap: {
                    gradeName: "{tests}.options.testGradeName"
                }
            }
        },
        writeDefaultsRequest2: {
            type: "fluid.test.nexus.writeDefaultsRequest",
            options: {
                termMap: {
                    gradeName: "{tests}.options.testGradeName"
                }
            }
        },
        constructComponentRequest1: {
            type: "fluid.test.nexus.constructComponentRequest",
            options: {
                termMap: {
                    componentPath: "{tests}.options.testComponentPath"
                }
            }
        },
        constructComponentRequest2: {
            type: "fluid.test.nexus.constructComponentRequest",
            options: {
                termMap: {
                    componentPath: "{tests}.options.testComponentPath2"
                }
            }
        },
        destroyComponentRequest1: {
            type: "fluid.test.nexus.destroyComponentRequest",
            options: {
                termMap: {
                    componentPath: "{tests}.options.testComponentPath"
                }
            }
        },
        destroyComponentRequest2: {
            type: "fluid.test.nexus.destroyComponentRequest",
            options: {
                termMap: {
                    componentPath: "{tests}.options.testComponentPath2"
                }
            }
        },
        readComponentRequest1: {
            type: "fluid.test.nexus.readComponentRequest",
            options: {
                termMap: {
                    componentPath: "{tests}.options.testComponentPath"
                }
            }
        },
        readComponentRequest2: {
            type: "fluid.test.nexus.readComponentRequest",
            options: {
                termMap: {
                    componentPath: "{tests}.options.testComponentPath"
                }
            }
        },
        readComponentRequest3: {
            type: "fluid.test.nexus.readComponentRequest",
            options: {
                termMap: {
                    componentPath: "{tests}.options.testComponentPath"
                }
            }
        }
    }
});
