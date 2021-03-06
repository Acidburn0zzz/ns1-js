"use strict";

let expect     = require('chai').expect,
    NS1        = require('../../lib'),
    utils      = require('./'),
    pluralize  = require('pluralize')


module.exports = function(options) {

  let {
    subject, 
    existing_val, 
    existing_obj,
    new_object_obj,
    update_val,
    update_key
  } = options

  let class_name    = subject.name,
      total_objects = 0

  describe('Should behave resoucefully', function() {

    before(() => {
      if (typeof existing_val === 'function') existing_val = existing_val()
      if (typeof existing_obj === 'function') existing_obj = existing_obj()
      if (typeof new_object_obj === 'function') new_object_obj = new_object_obj()
    })

    function object_comparisons(object, orig) {
      for (let key in orig) {
        if (key === 'data_source_id') {
          break
        }

        let val = orig[key]

        if (object[key] !== undefined && ['string', 'number'].indexOf(typeof val) !== -1) {
          expect(object[key]).to.eq(val)
        }
      }
    }

    describe(`${class_name}.find()`, function() {

      if (!options.skip_find_all) {

        it(`Should return all relevant objects in an array`, function() {
          return subject.find().then((objects) => {
            expect(Array.isArray(objects)).to.eq(true)
            expect(objects[0].constructor).to.eq(subject)
            total_objects = objects.length
          })
        })

      }

      it (`Should return a single object when an ID is specified`, function() {
        return subject.find(existing_val).then((object) => {
          expect(typeof object).to.eq('object')
          expect(Array.isArray(object)).to.eq(false)
          expect(object.constructor).to.eq(subject)
          
          object_comparisons.call(this, object.attributes, existing_obj)
        })
      })
    })

    describe(`${class_name}#update()`, function() {
      let old_update_attrs = {},
          new_update_attrs = {}
          
      new_update_attrs[update_key] = update_val

      after(function() {
        return subject.find(existing_val).then((object) => {
          return object.update(old_update_attrs)
        })
      })

      it(`Should update a resource's value`, function() {
        let object

        return subject.find(existing_val).then((_object) => {
          object                       = _object
          old_update_attrs[update_key] = object.attributes[update_key]

          return object.update(new_update_attrs)
        }).then((new_object) => {
          object_comparisons.call(this, new_object.attributes, object.attributes)
          expect(new_object.attributes[update_key]).to.eq(update_val)

          return subject.find(existing_val)
        }).then((object_check) => {
          expect(object_check.attributes[update_key]).to.eq(update_val)
        })
      })
    })

    describe(`${class_name}#save() by way of ${class_name}.create(), then ${class_name}#destroy(), temporary janky testing`, function() {
      it(`Should create a brand new ${class_name}, then destroy it`, function() {
        return subject.create(new_object_obj).then((object) => {
          object_comparisons.call(this, object.attributes, new_object_obj)

          if (!options.skip_find_all) {
            return subject.find()
            .then((objects) => {
              expect(objects.length).to.eq(total_objects + 1)

              return object.destroy()
            }).then((destroyed) => {
              expect(destroyed).to.eq(true)

              return subject.find()
            }).then((objects) => {
              expect(objects.length).to.eq(total_objects)
            })
          } else {
            return object.destroy()
            .then((destroyed) => {
              expect(destroyed).to.eq(true)
            })
          }
        })
      })
    })
  })
}
