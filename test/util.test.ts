import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'

import {maxBy, minBy} from '../src/util'

chai.use(chaiAsPromised)

const {expect} = chai

interface Item {
  name: string,
  value: number,
}

describe('util', () => {
  describe('maxBy', () => {
    it('should return the max value', () => {
      const collection: Item[] = [{name: 'a', value: 1}, {name: 'b', value: 2}, {name: 'c', value: 3}, {name: 'd', value: 4}, {name: 'e', value: 5}]
      expect(maxBy(collection, (item: Item) => item.value)).to.deep.equal({name: 'e', value: 5})
    })

    it('should return the first max value', () => {
      const collection: Item[] = [{name: 'a', value: 1}, {name: 'b', value: 5}, {name: 'c', value: 3}, {name: 'd', value: 5}, {name: 'e', value: 5}]
      expect(maxBy(collection, (item: Item) => item.value)).to.deep.equal({name: 'b', value: 5})
    })

    it('should return undefined when collection is empty', () => {
      const collection: Item[] = []
      expect(maxBy(collection, (item: Item) => item.value)).to.be.undefined
    })
  })

  describe('minBy', () => {
    it('should return the min value', () => {
      const collection: Item[] = [{name: 'a', value: 1}, {name: 'b', value: 2}, {name: 'c', value: 3}, {name: 'd', value: 4}, {name: 'e', value: 5}]
      expect(minBy(collection, (item: Item) => item.value)).to.deep.equal({name: 'a', value: 1})
    })

    it('should return the first min value', () => {
      const collection: Item[] = [{name: 'a', value: 5}, {name: 'b', value: 3}, {name: 'c', value: 1}, {name: 'd', value: 3}, {name: 'e', value: 1}]
      expect(minBy(collection, (item: Item) => item.value)).to.deep.equal({name: 'c', value: 1})
    })

    it('should return undefined when collection is empty', () => {
      const collection: Item[] = []
      expect(minBy(collection, (item: Item) => item.value)).to.be.undefined
    })
  })
})
