import { CANVAS_RERENDER_EVENT_TYPE } from './Canvas';
import Shape, {
  ShapeAttrs,
  applyShapeAttrsToContext,
  MousePosition,
} from './Shape';
import containerMixin from './containerMixin';
import { pxByRatio } from './utils';

export interface GroupAttrs extends ShapeAttrs {}
/**
 * Group is another container for shape. like Canvas, Group `add` or `remove` a shape
 * But Group need to be added to Canvas to get it and it's shapes renddered,
 * Group mix it's attr and shape's attr to render a shape.
 *
 * @export
 * @class Group
 * @extends {Shape<GroupAttrs>}
 */
export default class Group extends containerMixin(Shape) {
  type = 'group';
  shapes: Shape[] = [];
  constructor(attrs: GroupAttrs) {
    super(attrs);
  }
  /**
   * Add a shape to group
   *
   * @param {Shape} shape
   * @memberof Group
   */
  add(shape: Shape) {
    super.add(shape);
    // this.canvas && this.canvas.emit(CANVAS_RERENDER_EVENT_TYPE, this);
  }
  /**
   * Remove a shape from group
   *
   * @param {Shape} shape
   * @memberof Group
   */
  remove(shape: Shape) {
    super.remove(shape);
    shape.canvas = null;
    // this.canvas && this.canvas.emit(CANVAS_RERENDER_EVENT_TYPE, this);
  }
  render(ctx: CanvasRenderingContext2D) {
    const { x, y, ...rest } = this.attrs;
    this.shapes.forEach(shape => {
      ctx.save();
      // rerender canvas
      shape.parent = this;
      shape.canvas = this.canvas;
      // group内shape的实际样式 = assign(group.attr, shape.attr)
      applyShapeAttrsToContext(ctx, rest, shape.attrs);
      shape.render(ctx);
      ctx.restore();
    });
  }
  // 特殊处理 group 会再次分发事件
  isPointInShape(ctx: CanvasRenderingContext2D, e: MousePosition) {
    const { offsetX, offsetY, type } = e;
    const len = this.shapes.length;
    for (let index = len - 1; index >= 0; index--) {
      const shape = this.shapes[index];
      if (shape.isPointInShape(ctx, e)) {
        shape.emit(e.type, e, shape);
        break;
      }
    }
    return false;
  }
}
