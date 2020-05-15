// Computes the inverse of a 2x2 matrix.
export const inverseMatrix = ( [[x1, x2 ],[y1, y2]] : [[number, number], [number,number]] ) : null | [[number, number], [number,number]] => {
  const det = x1 * y2 - x2 * y1;
  if (Math.abs(det) < 0.00001) {
    console.error("error in inverseMatrix: determinant too small");
    return null;

  } else {
    return [
      [y2 / det, -x2 / det],
      [-y1 / det, x1 / det]
    ];
  }
};

// Multiplication Av (A a 2x2 matrix, v a 2x1 column vector)
// Return type: [xnew,ynew]
export const multMatVect = ( [[x1, x2],[y1, y2]] : [[number, number], [number,number]]
                           ,  [x , y ] : [number, number]) : [number, number] => {
  return [x1 * x + x2 * y, y1 * x + y2 * y];
};
