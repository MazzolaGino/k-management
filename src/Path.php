<?php

namespace KManagement;

use KLib2\Interfaces\IPath;

class Path implements IPath
{
    private string $url;
    private string $path;

    public function __construct()
    {
        $this->url = plugin_dir_url(__FILE__);
        $this->path = plugin_dir_path(__FILE__);
    }

    public function dir(string $endpoint = ''): string
    {

        if (\file_exists($this->path . $endpoint)) {
            return $this->path . $endpoint;
        }

        throw new \InvalidArgumentException("Unable to find the file ($endpoint)");
    }


    public function url(string $endpoint = ''): string
    {
        return $this->url . $endpoint;
    }
}
