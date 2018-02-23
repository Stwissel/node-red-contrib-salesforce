# Changelog

## 0.2.1

- Fixed bug that prevented subscriptions from completion
- Tested with latest Node-Red release 0.18.2
- Added header to OBM reply node

## 0.2.0

- Subscriptions now have an incoming connection. Subcriptions don't start on application load, but an incoming message. Message can contain subscribe/unsubscribe command

## 0.1.3

- Fixed an error where a failed subscription would crash the client

## 0.1.2

- Added acceptance of credentials from msg.sf object (concluded backports from benariss)
- fixed error throw for inbound message to be compatible toerror node

## 0.1.1

- Backported improvements from benariss
  - streaming.js -> return error instead of throwing
  - all JS -> return errors

## 0.1.0

### Environment / Versions

- Tested on node-red 0.17.5
- Requires nodeJS > 6.0
- Upgraded to a fork of nforce 1.9 using latest packages
- Upgraded lodash dependency to 4.17.4
- Upgraded xmljs dependency to 0.4.19
- Minor bug fixes
- Switched from `var` to `const` where possible

### Functionality

- Streaming node now supports Streaming API, Generic Streaming events and Platform events (new)
- Streaming node indicates subscription in UI
- Configuration node now allows to specify instance (pot) URL for more stable login
- Configuration node allows to specify to read credentials from environment, for Heroku compatible deployment (no credentials in version control) - or other platforms
