const { assert } = require('chai')
const { urlDatabase, users }= require('../dB/url&user')
const { generateRandomString, addUserInfo, findUserByEmail, validate, authenticator, urlsForUser } = require('../lib/helper')

describe('#findUserByEmail', () => {
  it('should return a user with a valid email', () => {
    const user = findUserByEmail("user@example.com", users);
    const expectedOutput = "userRandomID";

    assert.strictEqual(user.id, expectedOutput);
  });
  it('should return another user with a valid email', () => {
    const user = findUserByEmail("user2@example.com", users);
    const expectedOutput = "user2RandomID";

    assert.strictEqual(user.id, expectedOutput);
  });
  it('shoudl return undefined when passed an invalid email', () => {
    const user = findUserByEmail('random@example.com', users);
    const expectedOutput = undefined;

    assert.strictEqual(user.id, expectedOutput);
  });
});