import { Divider } from 'antd';
import { Toolbar } from 'gg-editor';
import styles from './index.less';
import ToolbarButton from './ToolbarButton';

const FlowToolbar = () => (
  <Toolbar className={styles.toolbar}>
    <ToolbarButton command="undo" />
    <ToolbarButton command="redo" />
    <Divider type="vertical" />
    <ToolbarButton command="zoomIn" icon="zoom-in" text="Zoom In" />
    <ToolbarButton command="zoomOut" icon="zoom-out" text="Zoom Out" />
    <ToolbarButton command="autoZoom" icon="fit-map" text="Fit Map" />
    <ToolbarButton command="resetZoom" icon="actual-size" text="Actual Size" />
    <Divider type="vertical" />
    <ToolbarButton command="append" text="Topic" />
    <ToolbarButton command="appendChild" icon="append-child" text="Subtopic" />
    <Divider type="vertical" />
    <ToolbarButton command="collapse" text="Fold" />
    <ToolbarButton command="expand" text="Unfold" />
  </Toolbar>
);

export default FlowToolbar;
