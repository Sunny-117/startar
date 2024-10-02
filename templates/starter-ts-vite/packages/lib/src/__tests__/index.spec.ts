import { sum } from 'shared';
import {expect, test} from 'vitest'

// 测试环境搭建
test('adds 1 + 2 to equal 3', () => {
	expect(sum(1, 2)).toBe(3);
});
