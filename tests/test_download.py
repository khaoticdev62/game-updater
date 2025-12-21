from download import Aria2Manager, DownloadQueue

# ... existing tests ...

def test_download_queue_add():
    queue = DownloadQueue(Aria2Manager())
    queue.add_task("http://example.com/file1.zip", "dist", "file1.zip")
    assert len(queue.tasks) == 1
    assert queue.tasks[0]['url'] == "http://example.com/file1.zip"

def test_download_queue_clear():
    queue = DownloadQueue(Aria2Manager())
    queue.add_task("http://example.com/file1.zip", "dist", "file1.zip")
    queue.clear()
    assert len(queue.tasks) == 0
