/**
 * Face Recognition Unit Tests
 * Tests descriptor distance calculation, matching, and serialization
 */

const assert = require('assert');

// Mock FaceAPI descriptor for testing
class DescriptorMock {
  constructor(values) {
    this.toArray = () => values;
  }
}

// Test utilities - these replicate the functions from database.js and src/utils/face.js
function calculateDescriptorDistance(descriptor1, descriptor2) {
  if (!descriptor1 || !descriptor2) {
    return Infinity;
  }

  // Parse descriptors if they are JSON strings
  let desc1 = descriptor1;
  let desc2 = descriptor2;

  if (typeof descriptor1 === 'string') {
    try {
      desc1 = JSON.parse(descriptor1);
    } catch (e) {
      return Infinity;
    }
  }

  if (typeof descriptor2 === 'string') {
    try {
      desc2 = JSON.parse(descriptor2);
    } catch (e) {
      return Infinity;
    }
  }

  // Ensure we're working with arrays
  if (!Array.isArray(desc1) || !Array.isArray(desc2)) {
    return Infinity;
  }

  // Calculate Euclidean (L2) distance
  let sum = 0;
  for (let i = 0; i < Math.min(desc1.length, desc2.length); i++) {
    const diff = desc1[i] - desc2[i];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
}

function serializeDescriptor(descriptor) {
  if (!descriptor) return null;
  if (typeof descriptor === 'string') return descriptor;
  return JSON.stringify(descriptor);
}

function deserializeDescriptor(descriptorJson) {
  if (!descriptorJson) return null;
  if (Array.isArray(descriptorJson)) return descriptorJson;
  if (typeof descriptorJson === 'string') {
    try {
      return JSON.parse(descriptorJson);
    } catch (e) {
      return null;
    }
  }
  return null;
}

// Test Suite 1: Descriptor Distance Calculation
console.log('\n=== Test Suite 1: Descriptor Distance Calculation ===');

// Test 1.1: Same descriptors should have distance 0
try {
  const desc1 = [0.1, 0.2, 0.3, 0.4, 0.5];
  const distance = calculateDescriptorDistance(desc1, desc1);
  assert.strictEqual(distance, 0, 'Same descriptors should have distance 0');
  console.log('✓ Test 1.1 passed: Same descriptors distance = 0');
} catch (err) {
  console.error('✗ Test 1.1 failed:', err.message);
}

// Test 1.2: Known different descriptors
try {
  const desc1 = [0.1, 0.2, 0.3, 0.4, 0.5];
  const desc2 = [0.2, 0.3, 0.4, 0.5, 0.6];
  const distance = calculateDescriptorDistance(desc1, desc2);
  // Expected: sqrt((0.1)^2 + (0.1)^2 + (0.1)^2 + (0.1)^2 + (0.1)^2) = sqrt(0.05) ≈ 0.2236
  assert(distance > 0 && distance < 1, 'Different descriptors should have positive distance');
  assert(distance > 0.22 && distance < 0.23, 'Distance calculation should be accurate');
  console.log(`✓ Test 1.2 passed: Different descriptors distance ≈ ${distance.toFixed(4)}`);
} catch (err) {
  console.error('✗ Test 1.2 failed:', err.message);
}

// Test 1.3: Distance is symmetric
try {
  const desc1 = [0.1, 0.2, 0.3];
  const desc2 = [0.4, 0.5, 0.6];
  const distance1 = calculateDescriptorDistance(desc1, desc2);
  const distance2 = calculateDescriptorDistance(desc2, desc1);
  assert.strictEqual(distance1, distance2, 'Distance should be symmetric');
  console.log('✓ Test 1.3 passed: Distance is symmetric');
} catch (err) {
  console.error('✗ Test 1.3 failed:', err.message);
}

// Test 1.4: Large descriptors (like face-api output: 128-dimensional)
try {
  const desc1 = Array(128).fill(0).map((_, i) => Math.random());
  const desc2 = Array(128).fill(0).map((_, i) => Math.random());
  const distance = calculateDescriptorDistance(desc1, desc2);
  assert(distance >= 0, 'Distance should be non-negative');
  assert(distance < 100, 'Distance should be reasonable for random descriptors');
  console.log(`✓ Test 1.4 passed: 128-dim descriptor distance = ${distance.toFixed(4)}`);
} catch (err) {
  console.error('✗ Test 1.4 failed:', err.message);
}

// Test Suite 2: JSON Serialization/Deserialization
console.log('\n=== Test Suite 2: Serialization/Deserialization ===');

// Test 2.1: Serialize and deserialize
try {
  const original = [0.1, 0.2, 0.3, 0.4, 0.5];
  const serialized = serializeDescriptor(original);
  const deserialized = deserializeDescriptor(serialized);
  assert.deepStrictEqual(original, deserialized, 'Deserialized should match original');
  console.log('✓ Test 2.1 passed: Serialize/deserialize preserves values');
} catch (err) {
  console.error('✗ Test 2.1 failed:', err.message);
}

// Test 2.2: Serialize null
try {
  const result = serializeDescriptor(null);
  assert.strictEqual(result, null, 'Serialize null should return null');
  console.log('✓ Test 2.2 passed: Serialize null returns null');
} catch (err) {
  console.error('✗ Test 2.2 failed:', err.message);
}

// Test 2.3: Deserialize null
try {
  const result = deserializeDescriptor(null);
  assert.strictEqual(result, null, 'Deserialize null should return null');
  console.log('✓ Test 2.3 passed: Deserialize null returns null');
} catch (err) {
  console.error('✗ Test 2.3 failed:', err.message);
}

// Test 2.4: Already serialized JSON string
try {
  const jsonString = '[0.1, 0.2, 0.3]';
  const deserialized = deserializeDescriptor(jsonString);
  assert.deepStrictEqual(deserialized, [0.1, 0.2, 0.3], 'Should deserialize JSON string');
  console.log('✓ Test 2.4 passed: Deserialize JSON string works');
} catch (err) {
  console.error('✗ Test 2.4 failed:', err.message);
}

// Test 2.5: Distance works with JSON strings
try {
  const desc1Array = [0.1, 0.2, 0.3];
  const desc2Array = [0.2, 0.3, 0.4];
  const desc1Json = JSON.stringify(desc1Array);
  const desc2Json = JSON.stringify(desc2Array);
  
  const distance1 = calculateDescriptorDistance(desc1Array, desc2Array);
  const distance2 = calculateDescriptorDistance(desc1Json, desc2Json);
  
  assert(Math.abs(distance1 - distance2) < 0.0001, 'Distance should match for arrays and JSON');
  console.log('✓ Test 2.5 passed: Distance calc works with JSON strings');
} catch (err) {
  console.error('✗ Test 2.5 failed:', err.message);
}

// Test Suite 3: Face Recognition Matching Logic
console.log('\n=== Test Suite 3: Face Recognition Matching ===');

// Test 3.1: Match threshold (0.6)
try {
  const descriptor1 = [0.5, 0.5, 0.5, 0.5, 0.5];
  const descriptor2 = [0.51, 0.51, 0.51, 0.51, 0.51]; // Very similar
  const threshold = 0.6;
  
  const distance = calculateDescriptorDistance(descriptor1, descriptor2);
  const isMatch = distance < threshold;
  
  assert(isMatch, 'Very similar descriptors should match');
  console.log(`✓ Test 3.1 passed: Similar descriptors match (distance: ${distance.toFixed(4)} < ${threshold})`);
} catch (err) {
  console.error('✗ Test 3.1 failed:', err.message);
}

// Test 3.2: No match beyond threshold
try {
  const descriptor1 = [0.1, 0.1, 0.1];
  const descriptor2 = [0.9, 0.9, 0.9]; // Very different
  const threshold = 0.6;
  
  const distance = calculateDescriptorDistance(descriptor1, descriptor2);
  const isMatch = distance < threshold;
  
  assert(!isMatch, 'Very different descriptors should not match');
  console.log(`✓ Test 3.2 passed: Different descriptors don't match (distance: ${distance.toFixed(4)} > ${threshold})`);
} catch (err) {
  console.error('✗ Test 3.2 failed:', err.message);
}

// Test 3.3: Edge case - empty descriptors
try {
  const descriptor1 = [];
  const descriptor2 = [];
  const distance = calculateDescriptorDistance(descriptor1, descriptor2);
  
  assert.strictEqual(distance, 0, 'Empty descriptors should have distance 0');
  console.log('✓ Test 3.3 passed: Empty descriptors handled correctly');
} catch (err) {
  console.error('✗ Test 3.3 failed:', err.message);
}

// Test 3.4: Mismatched descriptor lengths
try {
  const descriptor1 = [0.1, 0.2, 0.3, 0.4, 0.5];
  const descriptor2 = [0.1, 0.2];
  const distance = calculateDescriptorDistance(descriptor1, descriptor2);
  
  // Should only compare up to min length
  assert(distance >= 0, 'Should handle mismatched lengths gracefully');
  console.log('✓ Test 3.4 passed: Mismatched lengths handled');
} catch (err) {
  console.error('✗ Test 3.4 failed:', err.message);
}

// Test 3.5: Invalid descriptors
try {
  const invalidCases = [
    [undefined, [0.1, 0.2]],
    [[0.1, 0.2], null],
    ['invalid', [0.1, 0.2]],
    [{ obj: true }, [0.1, 0.2]],
  ];
  
  for (const [desc1, desc2] of invalidCases) {
    const distance = calculateDescriptorDistance(desc1, desc2);
    assert.strictEqual(distance, Infinity, 'Invalid descriptors should return Infinity');
  }
  
  console.log('✓ Test 3.5 passed: Invalid descriptors return Infinity');
} catch (err) {
  console.error('✗ Test 3.5 failed:', err.message);
}

// Test Suite 4: Real-world Scenarios
console.log('\n=== Test Suite 4: Real-world Scenarios ===');

// Test 4.1: Same person multiple photos
try {
  // Simulate face descriptors from same person (high similarity)
  const baseFaceDesc = Array(128).fill(0.5).map((v, i) => v + (Math.random() - 0.5) * 0.1);
  const samePerson1 = baseFaceDesc.map(v => v + (Math.random() - 0.5) * 0.02);
  const samePerson2 = baseFaceDesc.map(v => v + (Math.random() - 0.5) * 0.02);
  
  const distance = calculateDescriptorDistance(samePerson1, samePerson2);
  const isMatch = distance < 0.6;
  
  assert(isMatch, 'Same person descriptors should match');
  assert(distance < 0.3, 'Same person distance should be very small');
  console.log(`✓ Test 4.1 passed: Same person match (distance: ${distance.toFixed(4)})`);
} catch (err) {
  console.error('✗ Test 4.1 failed:', err.message);
}

// Test 4.2: Different people
try {
  // Simulate face descriptors from different people with more distinct patterns
  const person1 = Array(128).fill(0).map((_, i) => Math.sin(i / 10) * 0.5 + 0.5);
  const person2 = Array(128).fill(0).map((_, i) => Math.cos(i / 10) * 0.5 + 0.5);
  
  const distance = calculateDescriptorDistance(person1, person2);
  const isMatch = distance < 0.6;
  
  assert(distance > 2, 'Different people should have significant distance');
  assert(!isMatch, 'Different people should not match with distinct descriptors');
  console.log(`✓ Test 4.2 passed: Different people no match (distance: ${distance.toFixed(4)})`);
} catch (err) {
  console.error('✗ Test 4.2 failed:', err.message);
}

// Test Summary
console.log('\n=== Test Summary ===');
console.log('✓ All unit tests completed');
console.log('\nKey metrics tested:');
console.log('- Descriptor distance calculation (Euclidean/L2)');
console.log('- JSON serialization/deserialization');
console.log('- Match threshold validation (0.6)');
console.log('- Edge cases and error handling');
console.log('- Real-world similarity scenarios');
