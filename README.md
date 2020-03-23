# Sailplane - Utilities for AWS Serverless development in Javascript and Typescript

This repository is developed and maintained by the [Onica](https://www.onica.com) Cloud Native Development Practice
as a set of tools for developing AWS serverless applications in Javascript and Typescript. 
(It is written in Typescript, but compiles to ES6 with Typescript type definition files.)

Each directory contains another NPM project and is independently published. 
See the docs directory for details of each project, or find it published [online](https://docs.onica.com/projects/sailplane).

# make.sh

Use the make.sh script to build all of the projects in an order that resolves the dependencies between them.
```
$ ./make.sh clean   # delete all node_modules directories
$ ./make.sh build   # npm install, test, and build all packages
$ ./make.sh check   # check what packages need to be published
$ ./make.sh publish # npm publish packages with new version numbers (must have bump versions first and have permission)
$ ./make.sh all     # do clean, build, & publish
```
