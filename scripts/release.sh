#!/usr/bin/env bash
#
# Copyright (C) 2019 by eHealth Africa : http://www.eHealthAfrica.org
#
# See the NOTICE file distributed with this work for additional information
# regarding copyright ownership.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
#
set -Eeuo pipefail

function build_container {
    local container=$1
    local BUILD_OPTIONS="--no-cache --force-rm --pull"

    docker-compose build \
        ${BUILD_OPTIONS} \
        --build-arg GIT_REVISION=${TRAVIS_COMMIT} \
        --build-arg VERSION=${VERSION} \
        ${container}
}

function docker_push {
    local ORG="ehealthafrica"
    local TAG=$1
    local IMAGE=${ORG}/${APP}:${TAG}

    echo "Pushing Docker image ${IMAGE}"
    docker tag ${APP} ${IMAGE}
    docker push ${IMAGE}
}

if [[ "${TRAVIS_PULL_REQUEST}" != "false" ]]; then
    echo "--------------------------------------------------------------"
    echo "Skipping a release because this is a pull request: ${TRAVIS_PULL_REQUEST}"
    echo "--------------------------------------------------------------"
    exit 0
fi

# release version depending on TRAVIS_BRANCH (develop | release-#.#) / TRAVIS_TAG (#.#.#)
if [[ ${TRAVIS_TAG} =~ ^[0-9]+(\.[0-9]+){2}$ ]]; then
    VERSION=${TRAVIS_TAG}

elif [[ ${TRAVIS_BRANCH} =~ ^release\-[0-9]+\.[0-9]+$ ]]; then
    VERSION=`cat VERSION`
    # append "-rc" suffix
    VERSION=${VERSION}-rc

elif [[ ${TRAVIS_BRANCH} = "develop" ]]; then
    VERSION="alpha"

else
    echo "--------------------------------------------------------------"
    echo "Skipping a release because this branch is not permitted: ${TRAVIS_BRANCH}"
    echo "--------------------------------------------------------------"
    exit 0
fi

echo "--------------------------------------------------------------"
echo "Releasing in branch: ${TRAVIS_BRANCH}"
echo "Release version:     ${VERSION}"
echo "Release revision:    ${TRAVIS_COMMIT}"
echo "--------------------------------------------------------------"

APP="gather"

# Build and distribute the JS assets
build_container gather-assets
docker-compose run --rm gather-assets build

# Build and push docker image to docker hub
build_container ${APP}

# Login in docker hub
docker login -u ${DOCKER_HUB_USER} -p ${DOCKER_HUB_PASSWORD}

docker_push ${VERSION}
if [ -z "$TRAVIS_TAG" ]; then
    docker_push "${VERSION}--${TRAVIS_COMMIT}"
fi

docker logout
