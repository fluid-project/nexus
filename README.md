This repository has been archived and is now read-only. Please contact one of the fluid-project maintainers if you’d like to request it be unarchived for further development. [https://wiki.fluidproject.org/display/fluid/Get+Involved](https://fluidproject.atlassian.net/wiki/spaces/fluid/pages/11547481/Get+Involved)

Nexus
=====

The Infusion Nexus Integration Technology, allowing the interconnection of arbitrary sources and sinks of state via HTTP and WebSockets.

See: https://wiki.fluidproject.org/display/fluid/Nexus+API

Running Nexus
-------------

Please note that at this stage of development, some of the Nexus
endpoints enable arbitrary JavaScript to be sent to the Nexus over
HTTP to be run within the Nexus Node.js process. Therefore, it is
recommended that the Nexus be run within a Virtual Machine. A Vagrant
configuration is provided for running Nexus.

- `vagrant up` - install dependencies and run Nexus within a VM
- `vagrant halt` - stop the VM
- `vagrant destroy` - delete the VM

For more information on the use of Vagrant, please see:
https://github.com/GPII/qi-development-environments

Running Nexus in a Docker container
-----------------------------------

You can also run the Nexus in a [Docker](https://docs.docker.com/get-docker) container.

Once you have Docker installed, run the following commands to build a Docker image and start a container:

* Build the image: `docker build -t nexus .`
* Run the container: `docker run --name nexus -p 9081:9081 nexus`

The Nexus will be reachable on [localhost:9081](http://localhost:9081)

* To stop and remove the container: `docker rm -f nexus`

If you make change to the code, repeat the steps to build the image and start a new container.

Running the tests in a VM
-------------------------

To run the Nexus tests in a VM:

- Ensure that the VM is running (`vagrant up`); then
- `grunt tests`

Running the tests in a Docker container
---------------------------------------

To run the Nexus tests in a Docker container:

- Ensure you have built the Docker image (`docker build -t nexus .`); then
- `docker run --rm -ti nexus npm run test`

Trying it out
-------------

Prerequisites:

- curl (or other HTTP client)
- [wscat](https://www.npmjs.com/package/wscat) (or other WebSocket client)

In this example, we will construct a new component, register 2 model
listeners, and send a model update.

Start Nexus and make a PUT request to construct a new component:

```
$ vagrant up
$ curl -H 'Content-Type: application/json' -X PUT -d '{ "type": "fluid.modelComponent", "model": { "a": null } }' http://localhost:9081/components/example1
```

Next we will make WebSocket Bind Model connections to the constructed component. Set up 2 connections by executing the following in 2 separate terminals:

```
$ wscat -c ws://localhost:9081/bindModel/example1/a
```

And we can send an update message from one of the `wscat` sessions with:

```
> { "path": "", "value": "hello" }
```

If everything is working, we should see "hello" echoed back in both `wscat` sessions.

Finally, stop Nexus with:

```
$ vagrant halt
```
