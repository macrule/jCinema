#include <QtWebKit>

class ClearingWebView : public QWebView {
	Q_OBJECT
public:
	ClearingWebView(QWidget * parent = 0) : QWebView(parent) {}
protected:
	virtual void paintEvent(QPaintEvent *ev) {
		{
			QPainter p(this);
			p.setCompositionMode(QPainter::CompositionMode_Clear);
			p.setClipRegion(ev->region());
			p.eraseRect(ev->rect());
		}
		
		QWebView::paintEvent(ev);
	}
};
