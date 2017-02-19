import test = require('tape')
import path = require('path')
import linkLocalPackages from '../src'

test('links local packages', async t => {
  const root = path.join(__dirname, 'fixture')
  linkLocalPackages(root)
    .then(() => t.end())
    .catch(t.end)
})
