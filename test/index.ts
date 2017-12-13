import test = require('tape')
import path = require('path')
import linkLocalPackages from 'link-local-packages'

test('links local packages', t => {
  const root = path.join(__dirname, 'fixture')
  linkLocalPackages(root)
    .then(() => t.end())
    .catch(t.end)
})
