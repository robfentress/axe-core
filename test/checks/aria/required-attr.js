describe('aria-required-attr', function() {
	'use strict';

	var fixture = document.getElementById('fixture');
	var queryFixture = axe.testUtils.queryFixture;
	var checkContext = axe.testUtils.MockCheckContext();
	var options = undefined;

	afterEach(function() {
		fixture.innerHTML = '';
		checkContext.reset();
	});

	it('should detect missing attributes', function() {
		var vNode = queryFixture('<div id="target" role="slider" tabindex="1">');

		assert.isFalse(
			checks['aria-required-attr'].evaluate.call(
				checkContext,
				vNode.actualNode,
				options,
				vNode
			)
		);
		assert.deepEqual(checkContext._data, ['aria-valuenow']);
	});

	it('should return true if there is no role', function() {
		var vNode = queryFixture('<div id="target">');

		assert.isTrue(
			checks['aria-required-attr'].evaluate.call(
				checkContext,
				vNode.actualNode,
				options,
				vNode
			)
		);
		assert.isNull(checkContext._data);
	});

	it('should determine attribute validity by calling axe.commons.aria.requiredAttr', function() {
		var vNode = queryFixture(
			'<div id="target" role="cats" tabindex="1" aria-cats="maybe">'
		);

		var orig = axe.commons.aria.requiredAttr;
		var called = 0;
		axe.commons.aria.requiredAttr = function(role) {
			assert.equal(role, 'cats');
			called++;
			return ['aria-cats', 'aria-bats'];
		};
		assert.isFalse(
			checks['aria-required-attr'].evaluate.call(
				checkContext,
				vNode.actualNode,
				options,
				vNode
			)
		);
		assert.deepEqual(checkContext._data, ['aria-bats']);
		assert.equal(called, 1);

		axe.commons.aria.requiredAttr = orig;
	});

	it('should pass aria-valuenow if element has value property', function() {
		var vNode = queryFixture('<input id="target" type="range" role="slider">');

		assert.isTrue(
			checks['aria-required-attr'].evaluate.call(
				checkContext,
				vNode.actualNode,
				options,
				vNode
			)
		);
	});

	describe('options', function() {
		it('should require provided attribute names for a role', function() {
			axe.commons.aria.lookupTable.role.mccheddarton = {
				type: 'widget',
				attributes: {
					required: ['aria-valuemax']
				},
				owned: null,
				nameFrom: ['author'],
				context: null
			};
			var vNode = queryFixture('<div role="mccheddarton" id="target"></div>');
			var options = {
				mccheddarton: ['aria-snuggles']
			};
			assert.isFalse(
				checks['aria-required-attr'].evaluate.call(
					checkContext,
					vNode.actualNode,
					options,
					vNode
				)
			);
			assert.deepEqual(checkContext._data, ['aria-snuggles', 'aria-valuemax']);
			delete axe.commons.aria.lookupTable.role.mccheddarton;
		});
	});
});
